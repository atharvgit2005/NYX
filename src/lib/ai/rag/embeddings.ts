/**
 * Brand-kit RAG: chunk → embed → store → cosine-retrieve.
 *
 * No vector DB. At our scale (≤ ~1k chunks per brand) a Float32 cosine
 * sweep in Node is < 5ms and avoids an extra service. The embeddings
 * column is bytes (Float32 little-endian) which means we can swap to
 * pgvector or Pinecone later without reshaping callers.
 */
import prisma from '@/lib/prismadb'
import { getRouter } from '../providers'

const CHUNK_TARGET_CHARS = 1200
const CHUNK_OVERLAP_CHARS = 150

/** Split text into ~CHUNK_TARGET_CHARS-sized chunks at sentence
 *  boundaries when possible, falling back to hard cuts. Overlap helps
 *  the retriever catch facts that straddle a chunk boundary. */
export function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, '\n').trim()
  if (clean.length === 0) return []
  if (clean.length <= CHUNK_TARGET_CHARS) return [clean]

  // sentence-ish split first; preserve delimiters
  const sentences = clean.split(/(?<=[.!?\n])\s+/)
  const chunks: string[] = []
  let cur = ''
  for (const s of sentences) {
    if ((cur + ' ' + s).length > CHUNK_TARGET_CHARS && cur.length > 0) {
      chunks.push(cur.trim())
      // start next chunk with tail overlap from the previous to preserve context
      const tail = cur.slice(-CHUNK_OVERLAP_CHARS)
      cur = tail + ' ' + s
    } else {
      cur = cur ? cur + ' ' + s : s
    }
  }
  if (cur.trim()) chunks.push(cur.trim())
  return chunks
}

function vectorToBytes(v: Float32Array): Uint8Array<ArrayBuffer> {
  // Copy into a fresh ArrayBuffer-backed Uint8Array — Prisma's Bytes
  // column requires the concrete ArrayBuffer variant (not the union
  // ArrayBufferLike that bare `new Uint8Array(len)` produces in TS lib).
  const ab = new ArrayBuffer(v.byteLength)
  const out = new Uint8Array(ab)
  out.set(new Uint8Array(v.buffer, v.byteOffset, v.byteLength))
  return out
}

function bytesToVector(b: Uint8Array): Float32Array {
  // Copy to ensure correct alignment for Float32 + a non-shared buffer.
  const ab = new ArrayBuffer(b.byteLength)
  new Uint8Array(ab).set(b)
  return new Float32Array(ab)
}

function cosine(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/** Re-embed an entire kit's body of text. Wipes existing chunks for
 *  that kit first so callers don't have to think about idempotency. */
export async function reindexBrandKit(
  brandKitId: string,
  sources: Array<{ source: string; text: string }>,
): Promise<{ chunks: number; model: string } | { error: string }> {
  const router = getRouter()
  const provider = router.embedder()
  if (!provider || !provider.embed) {
    return { error: 'No embedding-capable provider configured' }
  }

  try {
    await prisma.embeddingChunk.deleteMany({ where: { brandKitId } })
  } catch {
    // table not yet migrated — let the caller surface the error
    return { error: 'EmbeddingChunk table not migrated yet' }
  }

  let count = 0
  let modelName = ''
  for (const src of sources) {
    const chunks = chunkText(src.text)
    let idx = 1
    for (const c of chunks) {
      const e = await provider.embed(c)
      modelName = e.model
      await prisma.embeddingChunk.create({
        data: {
          brandKitId,
          source: src.source,
          chunkIndex: idx++,
          text: c,
          embedding: vectorToBytes(e.vector),
          model: e.model,
        },
      })
      count++
    }
  }
  return { chunks: count, model: modelName }
}

export interface RetrievedChunk {
  id: string
  source: string
  text: string
  score: number
}

/** Top-K retrieval by cosine. K=6 is enough headroom for the DP packer
 *  upstream to drop low-value matches when the budget is tight. */
export async function retrieveRelevant(
  brandKitId: string,
  query: string,
  k = 6,
): Promise<RetrievedChunk[]> {
  if (!query.trim()) return []
  const router = getRouter()
  const provider = router.embedder()
  if (!provider || !provider.embed) return []

  let rows
  try {
    rows = await prisma.embeddingChunk.findMany({
      where: { brandKitId },
      select: { id: true, source: true, text: true, embedding: true },
    })
  } catch {
    return []
  }
  if (rows.length === 0) return []

  let qVec: Float32Array
  try {
    const e = await provider.embed(query)
    qVec = e.vector
  } catch {
    return []
  }

  const scored = rows.map((r) => ({
    id: r.id,
    source: r.source,
    text: r.text,
    score: cosine(qVec, bytesToVector(r.embedding as Uint8Array)),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k)
}
