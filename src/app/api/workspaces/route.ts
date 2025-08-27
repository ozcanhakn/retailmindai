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

    // Get all files for the user
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

    // Group files by month to create workspace-like structure
    const workspaces = files.reduce((acc, file) => {
      const date = new Date(file.createdAt as any);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          id: monthKey,
          name: `${monthName} Analizleri`,
          description: `${monthName} ayında yüklenen dosyalar`,
          fileCount: 0,
          totalRows: 0,
          totalSize: 0,
          createdAt: date.toISOString(),
          files: []
        };
      }
      
      acc[monthKey].fileCount++;
      acc[monthKey].totalRows += file.rowCount || 0;
      acc[monthKey].totalSize += file.sizeBytes || 0;
      acc[monthKey].files.push(file);
      
      return acc;
    }, {} as Record<string, any>);

    const workspaceList = Object.values(workspaces);

    return NextResponse.json({ 
      success: true, 
      workspaces: workspaceList,
      message: 'Workspace\'ler başarıyla yüklendi'
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    return NextResponse.json({ success: false, error: 'Workspace yükleme hatası' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'Workspace ID gerekli' }, { status: 400 });
    }

    // Parse workspace ID (format: YYYY-MM)
    const [year, month] = workspaceId.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    // Delete files in the workspace
    const deletedFiles = await db
      .delete(uploadedFiles)
      .where(eq(uploadedFiles.userId, session.user.id))
      .where(
        // This is a simplified approach - in a real app you'd have a proper workspace table
        // For now, we'll delete files created in that month
        uploadedFiles.createdAt >= startDate && uploadedFiles.createdAt <= endDate
      );

    return NextResponse.json({
      success: true,
      message: 'Workspace başarıyla silindi',
      deletedCount: deletedFiles.rowCount
    });

  } catch (error) {
    console.error('Delete workspace error:', error);
    return NextResponse.json({ success: false, error: 'Workspace silme hatası' }, { status: 500 });
  }
}
