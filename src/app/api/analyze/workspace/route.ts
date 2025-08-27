// src/app/api/analyze/workspace/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { setWorkspace } from '@/lib/workspace-store';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { name, description, fileIds } = await request.json();
    if (!name || !fileIds || fileIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Name ve fileIds gerekli' }, { status: 400 });
    }

    const workspaceId = crypto.randomUUID();

    // Store in memory for later retrieval
    setWorkspace(workspaceId, {
      userId: session.user.id,
      fileIds,
      name,
      description,
    });

    const workspace = {
      id: workspaceId,
      name,
      description: description || '',
      userId: session.user.id,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: fileIds.map((fileId: string) => ({
        id: fileId,
        filename: '',
        originalName: '',
        size: 0,
        type: 'text/csv',
        uploadedAt: new Date().toISOString(),
        processedData: null
      }))
    };

    return NextResponse.json({ success: true, workspace, message: 'Workspace oluşturuldu' });
  } catch (error) {
    console.error('Create workspace error:', error);
    return NextResponse.json({ success: false, error: 'Workspace oluşturma hatası' }, { status: 500 });
  }
}