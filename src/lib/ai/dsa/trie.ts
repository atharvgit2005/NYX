/**
 * Compact Trie for slash-command and @-mention autocomplete in the chat
 * input. O(prefix length) lookup, O(prefix + match count) for suggest.
 * Char-keyed because the alphabet is tiny (lowercase + dash) and the
 * payload is small enough that branching arity isn't worth optimising.
 */
export interface TrieEntry<T> {
  key: string
  payload: T
}

interface Node<T> {
  children: Map<string, Node<T>>
  /** Entries terminating at this node — usually 1, but we tolerate dupes. */
  values: TrieEntry<T>[]
}

function makeNode<T>(): Node<T> {
  return { children: new Map(), values: [] }
}

export class Trie<T> {
  private root: Node<T> = makeNode<T>()
  private size = 0

  insert(key: string, payload: T): void {
    let node = this.root
    for (const ch of key) {
      let next = node.children.get(ch)
      if (!next) {
        next = makeNode<T>()
        node.children.set(ch, next)
      }
      node = next
    }
    node.values.push({ key, payload })
    this.size++
  }

  /** Returns up to `limit` entries whose key starts with `prefix`. */
  suggest(prefix: string, limit = 8): TrieEntry<T>[] {
    let node = this.root
    for (const ch of prefix) {
      const next = node.children.get(ch)
      if (!next) return []
      node = next
    }
    const out: TrieEntry<T>[] = []
    const stack: Node<T>[] = [node]
    while (stack.length && out.length < limit) {
      const cur = stack.pop()!
      for (const v of cur.values) {
        out.push(v)
        if (out.length >= limit) return out
      }
      // DFS — order isn't load-bearing; we sort callers' results.
      for (const child of cur.children.values()) stack.push(child)
    }
    return out
  }

  count(): number {
    return this.size
  }
}
