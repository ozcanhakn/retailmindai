// src/app/api/analyze/process-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    const { fileId, fileData } = await request.json();
    
    if (!fileId || !fileData) {
      return NextResponse.json(
        { success: false, error: 'File ID ve data gerekli' },
        { status: 400 }
      );
    }

    // Python backend'e dosya gönder ve analiz yap
    const pythonResponse = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId,
        file_data: fileData,
        analysis_types: ['basic_stats', 'sales_analysis', 'product_analysis', 'customer_analysis', 'time_series']
      }),
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python backend error: ${pythonResponse.status}`);
    }

    const analysisResult = await pythonResponse.json();

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      message: 'Dosya analizi tamamlandı'
    });

  } catch (error) {
    console.error('Process file error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya işleme hatası' },
      { status: 500 }
    );
  }
}
