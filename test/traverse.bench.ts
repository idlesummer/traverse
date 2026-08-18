import type { TraverseHooks } from '@/traverse'
import { bench, describe } from 'vitest'
import { traverse } from '@/traverse'

type Chain = {
  depth: number
  next?: Chain
}

function createChain(maxDepth: number): Chain {
  const head: Chain = { depth: 0 }
  for (let depth=1, tail=head; depth < maxDepth; depth++) {
    tail.next = { depth }
    tail = tail.next
  }
  return head
}

// The naive, intuitive way to write this same walk - recursive rather
// than traverse()'s explicit stack. Benchmarked against the real
// implementation below, on identical input and hooks.
function traverseRecursive<TNode>(node: TNode, hooks: TraverseHooks<TNode>): boolean {
  if (hooks.visit?.(node) === true)
    return true

  const children = hooks.expand(node)
  if (!children)
    return true

  for (const child of children) {
    hooks.attach?.(child, node)
    if (traverseRecursive(child, hooks))
      return true
  }

  return hooks.leave?.(node) === true
}

// Deep enough to measure, shallow enough that the recursive version
// doesn't overflow the call stack (it starts failing around 8,000).
const depth = 3_000
const chain = createChain(depth)
const hooks: TraverseHooks<Chain> = {
  expand: (node) => (node.next ? [node.next] : []),
}

describe(`traversing a ${depth}-node chain`, () => {
  bench('traverse(): iterative', () => {
    traverse(chain, hooks)
  })

  bench('traverseRecursive(): recursive', () => {
    traverseRecursive(chain, hooks)
  })
})
