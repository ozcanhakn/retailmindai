import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db } from '@/db';
import { uploadedFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const files = await db
      .select({
        id: uploadedFiles.id,
        fileName: uploadedFiles.fileName,
        filePath: uploadedFiles.filePath,
        status: uploadedFiles.status,
        sizeBytes: uploadedFiles.sizeBytes,
        createdAt: uploadedFiles.createdAt,
      })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, session.user.id))
      .orderBy(uploadedFiles.createdAt);

    return NextResponse.json({
      success: true,
      files: files.map(f => ({
        ...f,
        createdAt: f.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ success: false, error: 'Dosya listesi alınamadı' }, { status: 500 });
  }
}
