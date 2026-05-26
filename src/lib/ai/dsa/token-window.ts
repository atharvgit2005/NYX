/**
 * Token-budget DP for context windowing.
 *
 * The chat route hands the LLM a window assembled from:
 *   - system prompt (mandatory, always included)
 *   - RAG chunks from the brand kit (each has a relevance score)
 *   - prior chat turns (more recent = higher priority)
 *
 * Naïve approach: greedily pack newest-first until budget is hit. That
 * works but starves high-value RAG chunks when the chat is long.
 *
 * Better: treat it as 0/1 knapsack on (item.weight=tokens,
 * item.value=score). For our scale (≤ ~40 candidate items) the DP table
 * is trivially small (< 80kB) and runs in <1ms. Items chat callers
 * always need to keep (the latest user turn, the system prompt) bypass
 * the DP and are reserved up front.
 */
export interface BudgetItem {
  id: string
  tokens: number
  score: number
  /** When true, item is always included regardless of budget pressure. */
  pinned?: boolean
}

/** Crude token estimate — ~4 chars per token. Plenty accurate for
 *  budgeting; we leave 20% headroom for the model's own overhead. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export interface PackResult {
  selected: string[]
  totalTokens: number
  totalScore: number
}

export function packByBudget(items: BudgetItem[], budget: number): PackResult {
  const pinned = items.filter((i) => i.pinned)
  const optional = items.filter((i) => !i.pinned)

  let used = 0
  const selected: string[] = []
  let scoreSum = 0
  for (const p of pinned) {
    used += p.tokens
    selected.push(p.id)
    scoreSum += p.score
  }
  const remaining = Math.max(0, budget - used)
  if (remaining <= 0 || optional.length === 0) {
    return { selected, totalTokens: used, totalScore: scoreSum }
  }

  // 0/1 knapsack DP on integer weights = tokens, integer-rounded scores.
  // For very large budgets we'd want a fractional/greedy approximation;
  // here we cap to keep the table bounded.
  const cap = Math.min(remaining, 8000)
  const n = optional.length
  // dp[w] = best score using items considered so far with weight w
  const dp = new Float64Array(cap + 1)
  const keep: Uint8Array[] = []
  for (let i = 0; i < n; i++) {
    const row = new Uint8Array(cap + 1)
    const it = optional[i]
    const w = Math.min(it.tokens, cap + 1)
    for (let c = cap; c >= 0; c--) {
      if (w <= c) {
        const cand = dp[c - w] + it.score
        if (cand > dp[c]) {
          dp[c] = cand
          row[c] = 1
        }
      }
    }
    keep.push(row)
  }
  // backtrack to recover chosen items
  let c = cap
  const chosenOptional: BudgetItem[] = []
  for (let i = n - 1; i >= 0; i--) {
    if (keep[i][c]) {
      chosenOptional.push(optional[i])
      c -= Math.min(optional[i].tokens, c)
    }
  }
  for (const it of chosenOptional) {
    selected.push(it.id)
    used += it.tokens
    scoreSum += it.score
  }
  return { selected, totalTokens: used, totalScore: scoreSum }
}
