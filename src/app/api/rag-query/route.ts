import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { embeddings as embeddingsTable, chunks as chunkTable, uploadedFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { file_id: fileId, query, top_k = 5 } = await req.json();
    if (!fileId || !query) {
      return NextResponse.json({ success: false, message: 'file_id ve query gerekli' }, { status: 400 });
    }

    // Ensure file exists
    const files = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, fileId));
    if (!files.length) {
      return NextResponse.json({ success: false, message: 'Dosya bulunamadı' }, { status: 404 });
    }
    if (files[0].userId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Bu dosyaya erişiminiz yok' }, { status: 403 });
    }

    // Load embeddings for file
    const embs = await db
      .select({ id: embeddingsTable.id, chunkId: embeddingsTable.chunkId, vector: embeddingsTable.vector, vectorStore: embeddingsTable.vectorStore })
      .from(embeddingsTable)
      .where(eq(embeddingsTable.fileId, fileId));

    console.log(`Found ${embs.length} embeddings for file ${fileId}`);

    if (!embs.length) {
      // Check if chunks exist
      const chunks = await db
        .select({ id: chunkTable.id })
        .from(chunkTable)
        .where(eq(chunkTable.fileId, fileId));
      
      console.log(`Found ${chunks.length} chunks for file ${fileId}`);
      
      return NextResponse.json({ 
        success: false, 
        answer: '', 
        retrieved_chunks: [], 
        message: `Bu dosya için embedding bulunamadı. Chunks: ${chunks.length}, Embeddings: ${embs.length}. Lütfen analizin tamamlandığından emin olun.` 
      });
    }

    // Create query embedding
    let queryVector: number[];
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    
    if (hasOpenAI) {
      try {
        const embRes = await openai.embeddings.create({ model: 'text-embedding-3-small', input: query });
        queryVector = embRes.data[0].embedding as unknown as number[];
      } catch (e) {
        console.error('OpenAI embedding error:', e);
        return NextResponse.json({ 
          success: false, 
          answer: '', 
          retrieved_chunks: [], 
          message: 'Embedding oluşturulamadı. OpenAI API hatası.' 
        });
      }
    } else {
      // Create simple embedding for query (same method as in workspace endpoint)
      queryVector = Array.from({ length: 1536 }, (_, j) => {
        const charCode = query.charCodeAt(j % query.length) || 0;
        return Math.sin(charCode + j) * 0.1;
      });
    }

    // Score by cosine similarity
    const scored = embs.map((e) => ({
      chunkId: e.chunkId,
      score: cosineSimilarity(queryVector, (e.vector as unknown as number[]) || []),
    }))
    .filter((s) => Number.isFinite(s.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(20, top_k)));

    const topChunkIds = scored.map((s) => s.chunkId);
    const topChunks = await db
      .select({ id: chunkTable.id, text: chunkTable.chunkText, type: chunkTable.chunkType, source: chunkTable.source })
      .from(chunkTable)
      .where(eq(chunkTable.fileId, fileId));
    const chunkMap = new Map(topChunks.map((c) => [c.id, c]));
    const retrieved = topChunkIds.map((id) => chunkMap.get(id)).filter(Boolean) as Array<{ id: string; text: string; type: string; source: string }>;

    if (!retrieved.length) {
      return NextResponse.json({ 
        success: false, 
        answer: '', 
        retrieved_chunks: [], 
        message: 'İlgili veri parçası bulunamadı.' 
      });
    }

    const context = retrieved.map((c) => c.text).join('\n');
    const prompt = `Veri özeti ve örnekler:\n${context}\n\nSoru: ${query}\nKısa, doğru ve veri odaklı cevap ver. Eğer emin değilsen 'veri yetersiz' de.`;

    // Use OpenAI for LLM response
    if (hasOpenAI) {
      try {
        const chat = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Kısa, doğru ve veri odaklı cevap ver.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 512,
        });

        const answer = chat.choices?.[0]?.message?.content || '';
        return NextResponse.json({ success: true, answer, retrieved_chunks: retrieved, message: 'OK' });
      } catch (e) {
        console.error('OpenAI chat error:', e);
        return NextResponse.json({ 
          success: false, 
          answer: '', 
          retrieved_chunks: [], 
          message: 'AI cevabı oluşturulamadı. OpenAI API hatası.' 
        });
      }
    } else {
      // Simple fallback response without OpenAI
      const answer = `Veri bulundu: ${retrieved.length} parça. Soru: "${query}". Detaylı analiz için OpenAI API anahtarı gerekli.`;
      return NextResponse.json({ success: true, answer, retrieved_chunks: retrieved, message: 'Basit mod - OpenAI yok' });
    }
  } catch (e: any) {
    console.error('RAG error:', e);
    return NextResponse.json({ 
      success: false, 
      message: e?.message || 'RAG hatası', 
      answer: '', 
      retrieved_chunks: [] 
    }, { status: 500 });
  }
}
