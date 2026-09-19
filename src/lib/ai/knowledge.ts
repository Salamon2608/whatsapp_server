import { prisma } from '@/lib/prisma'

export async function retrieveKnowledge(
  userId: string,
  queryText: string,
  k = 5,
): Promise<string[]> {
  const query = queryText.trim().toLowerCase()
  if (!query || k <= 0) return []

  try {
    const records = await prisma.aiKnowledge.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
      },
    })

    if (!records || records.length === 0) return []

    // Tokenize query words
    const queryWords = query.split(/\s+/).filter((w) => w.length > 2)

    // Score records by keyword matches
    const scored = records.map((rec) => {
      const text = `${rec.title} ${rec.content} ${rec.tags || ''}`.toLowerCase()
      let score = 0
      for (const word of queryWords) {
        if (text.includes(word)) score += 1
      }
      return { rec, score }
    })

    // Sort by relevance score descending
    scored.sort((a, b) => b.score - a.score)

    // Return top k items with some relevance or top default items if no strong matches
    const top = scored
      .filter((s) => s.score > 0)
      .slice(0, k)
      .map((s) => `${s.rec.title}:\n${s.rec.content}`)

    if (top.length > 0) return top

    // Fallback: if no specific keyword matched, include up to 2 items as general business context
    return records.slice(0, 2).map((r) => `${r.title}:\n${r.content}`)
  } catch (err) {
    console.error('[ai knowledge] retrieval failed:', err)
    return []
  }
}
