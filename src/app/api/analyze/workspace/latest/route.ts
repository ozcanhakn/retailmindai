// src/app/api/analyze/workspace/lates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db } from '@/db';
import { uploadedFiles, analysisResults } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get the latest uploaded file
    const files = await db
      .select({
        id: uploadedFiles.id,
        fileName: uploadedFiles.fileName,
        createdAt: uploadedFiles.createdAt,
        status: uploadedFiles.status,
        rowCount: uploadedFiles.rowCount,
        sizeBytes: uploadedFiles.sizeBytes
      })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, session.user.id))
      .orderBy(uploadedFiles.createdAt);

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Analiz edilecek dosya bulunamadı'
      }, { status: 404 });
    }

    const latestFile = files[files.length - 1];

    // Get analysis results for the latest file
    const analysis = await db
      .select({ analysisType: analysisResults.analysisType, resultJson: analysisResults.resultJson })
      .from(analysisResults)
      .where(eq(analysisResults.fileId, latestFile.id));

    // Build processed data object
    const processedData: Record<string, any> = {};
    for (const row of analysis) {
      if (row.analysisType !== 'raw_file_b64') {
        processedData[row.analysisType] = row.resultJson as unknown as any;
      }
    }

    const workspace = {
      id: 'latest',
      name: 'En Son Analiz',
      description: 'En son yüklenen dosya analizi',
      userId: session.user.id,
      status: 'completed',
      createdAt: latestFile.createdAt,
      updatedAt: new Date().toISOString(),
      files: [{
        id: latestFile.id,
        filename: latestFile.fileName,
        originalName: latestFile.fileName,
        size: latestFile.sizeBytes || 0,
        type: 'application/octet-stream',
        uploadedAt: latestFile.createdAt,
        processedData: processedData
      }]
    };

    return NextResponse.json({ success: true, workspace, message: 'En son analiz başarıyla yüklendi' });
  } catch (error) {
    console.error('Get latest workspace error:', error);
    return NextResponse.json({ success: false, error: 'Workspace yükleme hatası' }, { status: 500 });
  }
}
