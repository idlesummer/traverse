export type TraverseHooks<TNode> = {
  /** Called when visiting each node. Return true to stop traversal. */
  visit?: (node: TNode) => true | void

  /** Returns a node's children. Return null or undefined to stop the traversal. */
  expand: (node: TNode) => TNode[] | null | undefined

  /** Called after traversing a node's children. Return true to stop traversal. */
  leave?: (node: TNode) => true | void

  /** Attaches a child node to its parent */
  attach?: (child: TNode, parent: TNode) => void
}

/**
 * Traverses a tree depth-first.
 *
 * - For each node: visit, expand, children, leave.
 * - Children are traversed in the order returned by expand.
 * - Stopping does not run pending `leave` hooks.
 *
 * @example
 * Build a tree and mark each completed subtree:
 *
 * ```ts
 * traverse(root, {
 *   visit: (node) => node.name === 'target',
 *   expand: (node) => createChildren(node),
 *   leave: (node) => node.complete = true,
 *   attach: (child, parent) => parent.children.push(child),
 * })
 * ```
 */
export function traverse<TNode>(root: TNode, hooks: TraverseHooks<TNode>) {
  const { visit, expand, leave, attach } = hooks
  const nodeStack = [root]
  const exitStack = leave && [false] // Exit stack only exists if leave is provided

  while (nodeStack.length) {
    const node = nodeStack.pop()!
    const exit = exitStack?.pop()

    if (exit) { // Post-order branch for revisiting a node after its children
      if (leave!(node) === true)
        return
    }
    else {
      if (visit?.(node) === true)
        return  // Stop if the visitor has found its target

      const children = expand(node)
      if (!children)
        return  // Stop if requested by expansion

      if (leave) { // Only push nodes when leave is provided
        nodeStack.push(node)
        exitStack!.push(true)
      }
      // Process children in reverse so
      // they're popped in correct order
      for (let i = children.length-1; i >= 0; i--) {
        const child = children[i]!
        attach?.(child, node)
        nodeStack.push(child)
        exitStack?.push(false)
      }
    }
  }
}
