# @idlesummer/traverse
Declarative depth-first tree traversal with pre-order and post-order hooks.

## Background
Kept writing the same tree traversal algorithm by hand every time my projects needed to walk a tree. So I made a simple declarative helper for pre-order and post-order depth-first search: you pass in behavior instead of rewriting the entire algorithm.

## Install
```
npm install @idlesummer/traverse
```

## Usage
```ts
import { traverse } from '@idlesummer/traverse'

type Node = {
  name: string
  children?: Node[]
}

const tree: Node = {
  name: 'root',
  children: [
    { name: 'a', children: [{ name: 'a1' }] },
    { name: 'b' },
  ],
}

traverse(tree, {
  visit:  (node) => console.log(`visit ${node.name}`),
  expand: (node) => node.children ?? [],
  leave:  (node) => console.log(`leave ${node.name}`),
})

// visit root, visit a, visit a1, leave a1, leave a, visit b, leave b, leave root
```

That tree, visualized, with both orders it produces:
```
root
├─ a
│  └─ a1
└─ b

pre-order  (visit): root → a → a1 → b
post-order (leave): a1 → a → b → root
```

### Stopping and pruning
- **`visit` or `leave` returning `true`** stops the entire traversal immediately, wherever it happens to be.
- **`expand` returning `null`/`undefined`** *also* stops the entire traversal immediately — not just that one node's branch.
- **`expand` returning `[]`** does the opposite: it *prunes* just that one node (treats it as childless), while the rest of the tree keeps going normally.

So to skip a subtree without stopping everything else, prune it instead of stopping it:
```ts
traverse(tree, {
  expand: (node) => node.hidden ? [] : node.children ?? [],
})
```

See `test/traverse.test.ts` for the full test suite. Each test has a small diagram of the tree it uses and the order it produces. `test/traverse.bench.ts` benchmarks `traverse()` against the naive recursive equivalent.

## API
### `traverse(root, hooks)`
type: `(root: TNode, hooks: TraverseHooks<TNode>) => void`
Walks `root` depth-first, iteratively. Safe for very deep trees, no call-stack recursion. For each node:
1. `visit(node)` — called before its children.
2. `expand(node)` — returns the node's children.
3. Children, in the order `expand` returned them.
4. `leave(node)` — called after all of a node's children (and their descendants) are done.

#### `root`
type: `TNode`
The tree's root node.

#### `hooks.visit`
type: `(node: TNode) => unknown`
Called before a node's children.

#### `hooks.expand`
type: `(node: TNode) => TNode[] | null | undefined`
Returns the node's children.
- Required

#### `hooks.leave`
type: `(node: TNode) => unknown`
Called after all of a node's children (and their descendants) are done.

#### `hooks.attach`
type: `(child: TNode, parent: TNode) => unknown`
Called once per child, right before it's queued.

## Contributors
- [@idlesummer](https://github.com/idlesummer)
- [@lettertoelias](https://github.com/lettertoelias)

## License
[MIT](./LICENSE) © Nash Luis Maramag
