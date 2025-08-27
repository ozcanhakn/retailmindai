import { config as dotenvConfig } from 'dotenv';
// Load .env then override with .env.local if present (for local dev)
dotenvConfig();
dotenvConfig({ path: '.env.local', override: true });
import { Worker, Job } from 'bullmq';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/db';
import { uploadedFiles, analysisResults, chunks as chunkTable, embeddings as embeddingsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { openai } from '@/lib/openai';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function persistAnalysis(fileId: string, processedData: any) {
  const analysisEntries: Array<{ type: string; result: any }> = [
    ['basic_stats', processedData?.basic_stats],
    ['sales_analysis', processedData?.sales_analysis],
    ['product_analysis', processedData?.product_analysis],
    ['customer_analysis', processedData?.customer_analysis],
    ['data_preview', processedData?.data_preview],
  ]
    .filter(([, v]) => v != null)
    .map(([k, v]) => ({ type: k as string, result: v }));

  if (analysisEntries.length) {
    await Promise.all(
      analysisEntries.map((entry) =>
        db.insert(analysisResults).values({
          fileId,
          analysisType: entry.type,
          resultJson: entry.result,
          createdAt: new Date(),
        })
      )
    );
  }

  // Build chunks
  const toJson = (obj: any) => {
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  };
  const chunkRecords: Array<{ text: string; type: string; source: string }> = [];
  for (const [k, v] of Object.entries(processedData || {})) {
    if (k === 'data_preview') continue;
    const text = toJson({ [k]: v });
    const segmentSize = 1000;
    for (let i = 0; i < text.length; i += segmentSize) {
      chunkRecords.push({ text: text.slice(i, i + segmentSize), type: 'analysis', source: k });
    }
  }
  if (Array.isArray(processedData?.data_preview)) {
    processedData.data_preview.slice(0, 100).forEach((row: any, idx: number) => {
      chunkRecords.push({ text: toJson(row), type: 'row', source: `row_${idx}` });
    });
  }

  const insertedChunkIds: string[] = [];
  for (const rec of chunkRecords) {
    const res = await db
      .insert(chunkTable)
      .values({ fileId, chunkText: rec.text, chunkType: rec.type, source: rec.source, createdAt: new Date() })
      .returning({ id: chunkTable.id });
    if (res?.[0]?.id) insertedChunkIds.push(res[0].id);
  }

  if (process.env.OPENAI_API_KEY && chunkRecords.length) {
    const batchSize = 50;
    for (let i = 0; i < chunkRecords.length; i += batchSize) {
      const batch = chunkRecords.slice(i, i + batchSize);
      const inputs = batch.map((b) => b.text);
      try {
        const embRes = await openai.embeddings.create({ model: 'text-embedding-3-small', input: inputs });
        const vectors = embRes.data.map((d) => d.embedding);
        const rows = vectors.map((vec, j) => ({
          fileId,
          chunkId: insertedChunkIds[i + j],
          vector: vec as any,
          vectorStore: 'pg-json',
          createdAt: new Date(),
        }));
        for (const row of rows) await db.insert(embeddingsTable).values(row);
      } catch {}
    }
  }

  // Update file record
  await db
    .update(uploadedFiles)
    .set({
      status: 'completed',
      rowCount: (processedData?.basic_stats?.total_rows as number) ?? undefined,
      columns: (processedData?.columns as any) ?? undefined,
    })
    .where(eq(uploadedFiles.id, fileId));
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

async function processJob(job: Job) {
  const { fileId, s3Key } = job.data as { fileId: string; s3Key: string };
  try {
    await db.update(uploadedFiles).set({ status: 'processing' }).where(eq(uploadedFiles.id, fileId));

    const bucketName = process.env.AWS_S3_BUCKET as string;
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: s3Key }));
    const bodyBuffer = await streamToBuffer(obj.Body as any);
    const fileB64 = bodyBuffer.toString('base64');

    // Call python backend for analysis
    const pyRes = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, file_data: fileB64, analysis_types: ['basic_stats', 'sales_analysis', 'product_analysis', 'customer_analysis'] }),
    });
    if (!pyRes.ok) throw new Error(`Python backend error: ${pyRes.status}`);
    const pyData = await pyRes.json();
    const processedData = pyData?.analysis || null;
    if (processedData) await persistAnalysis(fileId, processedData);
  } catch (e: any) {
    await db.update(uploadedFiles).set({ status: 'failed', error: e?.message || 'unknown error' }).where(eq(uploadedFiles.id, fileId));
    throw e;
  }
}

// Start worker
// eslint-disable-next-line no-new
new Worker('analysis', processJob, { connection });

console.log('[worker] Analysis worker started');


