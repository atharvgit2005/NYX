/**
 * Conversation tree.
 *   ChatMessage rows form a tree via `parentId`. Editing a user turn or
 *   regenerating an assistant turn creates a *new* branch instead of
 *   mutating history. This keeps an audit trail and lets the UI show
 *   "previous answer" toggles without re-querying the LLM.
 *
 * The walk helper produces the *active path* — the linear list of turns
 * we send to the LLM, derived from the leaf the UI is currently focused
 * on by walking parent links up to the root.
 */
export interface TreeNode {
  id: string
  parentId: string | null
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolName?: string | null
  toolArgs?: unknown
  createdAt: Date
}

/** Build an index → walk to the root from `leafId`, yielding root-first. */
export function activePath(nodes: TreeNode[], leafId: string): TreeNode[] {
  const byId = new Map<string, TreeNode>()
  for (const n of nodes) byId.set(n.id, n)

  const reversed: TreeNode[] = []
  let cur: TreeNode | undefined = byId.get(leafId)
  // depth guard — pathological loops shouldn't ever exist but we bound anyway
  let safety = 1000
  while (cur && safety-- > 0) {
    reversed.push(cur)
    cur = cur.parentId ? byId.get(cur.parentId) : undefined
  }
  return reversed.reverse()
}

/** Latest leaf id in the tree (most recent createdAt). When the UI
 *  hasn't picked an active branch, this is the natural default. */
export function latestLeafId(nodes: TreeNode[]): string | null {
  if (nodes.length === 0) return null
  const childrenOf = new Set(nodes.map((n) => n.parentId).filter(Boolean) as string[])
  // a leaf has no node pointing to it as parent
  const leaves = nodes.filter((n) => !childrenOf.has(n.id))
  if (leaves.length === 0) return nodes[nodes.length - 1].id
  leaves.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return leaves[0].id
}
