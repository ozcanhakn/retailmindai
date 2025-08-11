import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
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

    const { fileId } = params;
    
    // Here you would typically:
    // 1. Check processing status from database/queue
    // 2. Verify file belongs to current user
    // For now, we'll return a mock status
    
    const statuses = ['waiting', 'uploading', 'processing', 'completed', 'error'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return NextResponse.json({
      success: true,
      fileId,
      status: randomStatus,
      progress: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 100),
      message: getStatusMessage(randomStatus),
      userId: session.user.id
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Durum kontrolü hatası' },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'waiting': return 'İşlem bekleniyor';
    case 'uploading': return 'Dosya yükleniyor';
    case 'processing': return 'Veri işleniyor';
    case 'completed': return 'İşlem tamamlandı';
    case 'error': return 'Hata oluştu';
    default: return 'Bilinmeyen durum';
  }
}