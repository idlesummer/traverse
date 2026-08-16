import { describe, expect, it } from 'vitest'
import { traverse } from '@/traverse.js'

type Node = {
  name: string,
  children?: Node[]
}

describe('traverse', () => {
  describe('ordering', () => {
    it('visits nodes in pre-order', () => {
      /*
       * pre-order: a → b → c → d
       * a
       * ├─ b
       * └─ c
       *    └─ d
       */
      const tree: Node = { name: 'a', children: [{ name: 'b' }, { name: 'c', children: [{ name: 'd' }] }] }
      const order: string[] = []

      traverse(tree, {
        visit:  (node) => order.push(node.name),
        expand: (node) => node.children ?? [],
      })
      expect(order).toEqual(['a', 'b', 'c', 'd'])
    })

    it('calls leave in post-order, after a node\'s children', () => {
      /*
       * post-order (leave): b → c → a
       * a
       * ├─ b
       * └─ c
       */
      const tree: Node = { name: 'a', children: [{ name: 'b' }, { name: 'c' }] }
      const order: string[] = []

      traverse(tree, {
        expand: (node) => node.children ?? [],
        leave:  (node) => order.push(node.name),
      })
      expect(order).toEqual(['b', 'c', 'a'])
    })

    it('visits children in the order expand returns them', () => {
      const tree: Node = { name: 'a', children: [{ name: 'z' }, { name: 'y' }, { name: 'x' }] }
      const order: string[] = []

      traverse(tree, {
        visit:  (node) => order.push(node.name),
        expand: (node) => node.children ?? [],
      })
      expect(order).toEqual(['a', 'z', 'y', 'x'])
    })
  })

  describe('early stopping', () => {
    it('stops traversal when visit returns true', () => {
      /*
       * visited: a → b
       * a
       * ├─ b   ← visit(b) returns true, stop
       * └─ c   (never reached)
       */
      const tree: Node = { name: 'a', children: [{ name: 'b' }, { name: 'c' }] }
      const visited: string[] = []

      traverse(tree, {
        visit:  (node) => (visited.push(node.name), node.name === 'b'),
        expand: (node) => node.children ?? [],
      })
      expect(visited).toEqual(['a', 'b'])
    })

    it('does not run pending leave hooks after stopping early', () => {
      /*
       * leave calls: (none)
       * a
       * ├─ b   ← stop here; a's pending leave never fires
       * └─ c
       */
      const tree: Node = { name: 'a', children: [{ name: 'b' }, { name: 'c' }] }
      const left: string[] = []

      traverse(tree, {
        visit:  (node) => node.name === 'b',
        expand: (node) => node.children ?? [],
        leave:  (node) => left.push(node.name),
      })
      expect(left).toEqual([])
    })

    it('stops the entire traversal, not just the current subtree, when expand returns undefined', () => {
      /*
       * visited: a → b
       * a
       * ├─ b   ← expand(b) is undefined: halts the whole traversal
       * └─ c   (still queued, but never reached)
       */
      const tree: Node = { name: 'a', children: [{ name: 'b' }, { name: 'c' }] }
      const visited: string[] = []

      traverse(tree, {
        visit:  (node) => visited.push(node.name),
        expand: (node) => (node.name === 'b' ? undefined : node.children ?? []),
      })
      expect(visited).toEqual(['a', 'b'])
    })
  })

  describe('attach', () => {
    it('calls attach for each child as it is pushed (reverse of expand order), before descending into it', () => {
      /*
       * attach order: a→c, a→b  (reverse of expand's [b, c])
       * a
       * ├─ b
       * └─ c
       */
      const tree: Node = { name: 'a', children: [{ name: 'b' }, { name: 'c' }] }
      const attachments: string[] = []

      traverse(tree, {
        expand: (node) => node.children ?? [],
        attach: (child, parent) => attachments.push(`${parent.name}->${child.name}`),
      })
      expect(attachments).toEqual(['a->c', 'a->b'])
    })
  })

  describe('edge cases', () => {
    it('handles a single node with no children', () => {
      /*
       * visited: a
       * a   (no children)
       */
      const tree: Node = { name: 'a' }
      const order: string[] = []

      traverse(tree, {
        visit:  (node) => order.push(node.name),
        expand: (node) => node.children ?? [],
      })
      expect(order).toEqual(['a'])
    })

    it('traverses deep chains iteratively, without a call-stack overflow', () => {
      /*
       * visited: all 100,000 nodes, no stack overflow
       * 0 → 1 → 2 → … → 99999   (100,000-node chain)
       */
      type Chain = {
        depth: number,
        next?: Chain
      }
      const depth = 100_000
      const head: Chain = { depth: 0 }

      for (let i = 1, tail = head; i < depth; i++) {
        tail.next = { depth: i }
        tail = tail.next
      }

      let count = 0
      traverse(head, {
        visit:  () => count++,
        expand: (node) => node.next ? [node.next] : [],
      })
      expect(count).toBe(depth)
    })
  })
})
