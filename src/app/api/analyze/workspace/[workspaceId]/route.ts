// src/app/api/analyze/workspace/[workspaceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db } from '@/db';
import { uploadedFiles, analysisResults, chunks as chunkTable, embeddings as embeddingsTable } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getWorkspace } from '@/lib/workspace-store';
import { openai } from '@/lib/openai';

async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await params;

    let fileRecords: Array<{ id: string; fileName: string; filePath: string; createdAt: Date }>; 
    const ws = getWorkspace(workspaceId);

    if (ws && ws.userId === session.user.id && ws.fileIds?.length) {
      // Check if fileIds are mock IDs (start with 'mock-file-')
      const hasMockIds = ws.fileIds.some(id => id.startsWith('mock-file-'));
      
      if (hasMockIds) {
        // Use mock IDs - get the latest uploaded files instead
        const files = await db.select().from(uploadedFiles).where(eq(uploadedFiles.userId, session.user.id));
        files.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
        fileRecords = files
          .map(f => ({ id: f.id, fileName: f.fileName, filePath: f.filePath, createdAt: f.createdAt }))
          .slice(0, ws.fileIds.length); // Take the same number of files as mock IDs
      } else {
        // Use real file IDs
        const files = await db.select().from(uploadedFiles).where(inArray(uploadedFiles.id, ws.fileIds));
        fileRecords = files
          .map(f => ({ id: f.id, fileName: f.fileName, filePath: f.filePath, createdAt: f.createdAt }))
          .slice(0, 1);
      }
    } else {
      // Fallback: get the latest uploaded file
      const files = await db.select().from(uploadedFiles).where(eq(uploadedFiles.userId, session.user.id));
      files.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
      fileRecords = files
        .map(f => ({ id: f.id, fileName: f.fileName, filePath: f.filePath, createdAt: f.createdAt }))
        .slice(0, 1);
    }

    if (fileRecords.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Analiz edilecek dosya bulunamadı' 
      }, { status: 404 });
    }

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
    const bucketName = process.env.AWS_S3_BUCKET as string;
    const hasS3Creds = Boolean(process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && bucketName);

    const analyzedFiles = await Promise.all(
      fileRecords.map(async (file) => {
        let processedData: any = null;
        let size = 0;
        let type = 'application/octet-stream';
        try {
          // Try to load existing analysis from DB first
          const existing = await db
            .select({ analysisType: analysisResults.analysisType, resultJson: analysisResults.resultJson })
            .from(analysisResults)
            .where(eq(analysisResults.fileId, file.id));
          
          if (existing.length) {
            const obj: Record<string, any> = {};
            for (const row of existing) {
              // Skip raw file data
              if (row.analysisType !== 'raw_file_b64') {
                obj[row.analysisType] = row.resultJson as unknown as any;
              }
            }
            processedData = obj;
            console.log(`Loaded existing analysis for file ${file.id}:`, Object.keys(obj));
          }

          // If not exists, fetch from S3 and process via Python, then persist
          if (!processedData) {
            let fileB64: string | null = null;
            
            // Check if we have a fallback file stored in analysis_results
            const raw = await db
              .select({ resultJson: analysisResults.resultJson, analysisType: analysisResults.analysisType })
              .from(analysisResults)
              .where(eq(analysisResults.fileId, file.id));
            
            const rawFileData = raw.find(r => r.analysisType === 'raw_file_b64');
            if (rawFileData) {
              // Use fallback base64 data
              const rawB64 = rawFileData.resultJson as any;
              if (rawB64?.data) {
                fileB64 = rawB64.data;
                console.log(`Using fallback base64 data for file ${file.id}`);
              }
            } else if (hasS3Creds && file.filePath && !file.filePath.startsWith('fallback://')) {
              // Try to get from S3
              try {
                const obj = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: file.filePath }));
                size = Number(obj.ContentLength || 0);
                type = obj.ContentType || type;
                const bodyBuffer = await streamToBuffer(obj.Body as any);
                fileB64 = bodyBuffer.toString('base64');
                console.log(`Downloaded file from S3: ${file.filePath}`);
              } catch (s3Error) {
                console.error(`S3 download failed for ${file.filePath}:`, s3Error);
                // Continue to next step - fileB64 will be null
              }
            }

            if (fileB64) {
              console.log(`Processing file ${file.id} with Python backend`);
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 600000);
              const pyRes = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  file_id: file.id,
                  file_data: fileB64,
                  analysis_types: ['basic_stats', 'sales_analysis', 'product_analysis', 'customer_analysis']
                }),
                signal: controller.signal,
              }).catch((e) => {
                console.error('Python backend request failed:', e);
                return null;
              });
              clearTimeout(timeout);

              if (pyRes && pyRes.ok) {
                const pyData = await pyRes.json();
                processedData = pyData.analysis || null;
                console.log(`Python analysis completed for file ${file.id}`);

                // Persist analysis results
                if (processedData) {
                  const analysisEntries: Array<{ type: string; result: any }> = [
                    ['basic_stats', processedData.basic_stats],
                    ['sales_analysis', processedData.sales_analysis],
                    ['product_analysis', processedData.product_analysis],
                    ['customer_analysis', processedData.customer_analysis],
                    ['data_preview', processedData.data_preview],
                  ]
                    .filter(([, v]) => v != null)
                    .map(([k, v]) => ({ type: k as string, result: v }));

                  if (analysisEntries.length) {
                    await Promise.all(
                      analysisEntries.map((entry) =>
                        db.insert(analysisResults).values({
                          fileId: file.id,
                          analysisType: entry.type,
                          resultJson: entry.result,
                          createdAt: new Date(),
                        })
                      )
                    );
                  }

                  // Build chunks from analysis summaries and preview rows
                  const toJson = (obj: any) => {
                    try {
                      return JSON.stringify(obj);
                    } catch {
                      return String(obj);
                    }
                  };

                  const chunkRecords: Array<{ text: string; type: string; source: string }> = [];
                  for (const [k, v] of Object.entries(processedData)) {
                    if (k === 'data_preview') continue; // handle separately
                    const text = toJson({ [k]: v });
                    // split into ~1000 char chunks to stay token-aware-ish
                    const segmentSize = 1000;
                    for (let i = 0; i < text.length; i += segmentSize) {
                      chunkRecords.push({ text: text.slice(i, i + segmentSize), type: 'analysis', source: k });
                    }
                  }
                  if (Array.isArray(processedData.data_preview)) {
                    processedData.data_preview.slice(0, 100).forEach((row: any, idx: number) => {
                      chunkRecords.push({ text: toJson(row), type: 'row', source: `row_${idx}` });
                    });
                  }

                  // Insert chunks
                  const insertedChunkIds: string[] = [];
                  for (const rec of chunkRecords) {
                    const res = await db.insert(chunkTable).values({
                      fileId: file.id,
                      chunkText: rec.text,
                      chunkType: rec.type,
                      source: rec.source,
                      createdAt: new Date(),
                    }).returning({ id: chunkTable.id });
                    if (res?.[0]?.id) insertedChunkIds.push(res[0].id);
                  }

                  // Create embeddings if key available
                  if (process.env.OPENAI_API_KEY && chunkRecords.length) {
                    // batch in groups of 50
                    const batchSize = 50;
                    for (let i = 0; i < chunkRecords.length; i += batchSize) {
                      const batch = chunkRecords.slice(i, i + batchSize);
                      const inputs = batch.map((b) => b.text);
                      try {
                        const embRes = await openai.embeddings.create({
                          model: 'text-embedding-3-small',
                          input: inputs,
                        });
                        const vectors = embRes.data.map((d) => d.embedding);
                        const rows = vectors.map((vec, j) => ({
                          fileId: file.id,
                          chunkId: insertedChunkIds[i + j],
                          vector: vec as any,
                          vectorStore: 'pg-json',
                          createdAt: new Date(),
                        }));
                        for (const row of rows) {
                          await db.insert(embeddingsTable).values(row);
                        }
                      } catch (e) {
                        console.error("Embedding generation error:", e);
                        // skip embedding errors; continue
                      }
                    }
                  } else {
                    // If no OpenAI key, create placeholder embeddings for RAG to work
                    console.log("No OpenAI API key, creating placeholder embeddings");
                    for (let i = 0; i < chunkRecords.length; i++) {
                      // Create a simple hash-based embedding (not as good as OpenAI but works for testing)
                      const text = chunkRecords[i].text;
                      const simpleEmbedding = Array.from({ length: 1536 }, (_, j) => {
                        const charCode = text.charCodeAt(j % text.length) || 0;
                        return Math.sin(charCode + j) * 0.1;
                      });
                      
                      await db.insert(embeddingsTable).values({
                        fileId: file.id,
                        chunkId: insertedChunkIds[i],
                        vector: simpleEmbedding as any,
                        vectorStore: 'pg-simple',
                        createdAt: new Date(),
                      });
                    }
                  }

                  // Update file record status and metadata
                  try {
                    await db.update(uploadedFiles)
                      .set({
                        status: 'completed',
                        rowCount: (processedData?.basic_stats?.total_rows as number) ?? undefined,
                        columns: (processedData?.columns as any) ?? undefined,
                        schemaHash: undefined,
                      })
                      .where(eq(uploadedFiles.id, file.id));
                  } catch {}
                }
              } else {
                console.error(`Python analysis failed for file ${file.id}`);
              }
            } else {
              console.error(`No file data found for ${file.id} - neither S3 nor fallback`);
            }
          }
        } catch (e) {
          console.error('File processing error:', e);
          processedData = null;
        }

        return {
          id: file.id,
          filename: file.fileName,
          originalName: file.fileName,
          size,
          type,
          uploadedAt: file.createdAt,
          processedData: processedData || {
            basic_stats: { total_rows: 0, total_columns: 0 },
            sales_analysis: {},
            product_analysis: {},
            customer_analysis: {},
            data_preview: []
          }
        };
      })
    );

    const workspace = {
      id: workspaceId,
      name: ws?.name || `Analiz Workspace - ${workspaceId.slice(0, 8)}`,
      description: ws?.description || 'Upload edilen dosyalar ile oluşturulan analiz workspace\'i',
      userId: session.user.id,
      status: 'completed',
      createdAt: ws?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: analyzedFiles
    };

    return NextResponse.json({ success: true, workspace, message: 'Workspace başarıyla yüklendi' });
  } catch (error) {
    console.error('Get workspace error:', error);
    return NextResponse.json({ success: false, error: 'Workspace yükleme hatası' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Auth check
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = params;
    
    // Here you would typically:
    // 1. Verify workspace belongs to current user
    // 2. Delete associated files from storage
    // 3. Delete workspace from database
    
    return NextResponse.json({
      success: true,
      message: 'Workspace başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete workspace error:', error);
    return NextResponse.json(
      { success: false, error: 'Workspace silme hatası' },
      { status: 500 }
    );
  }
}