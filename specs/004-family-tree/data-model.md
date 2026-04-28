# Data Model: Interactive Family Tree

**Feature**: 004 — Family Tree
**Date**: 2026-04-27

---

## Input: `data/individuals.json`

Consumed read-only. Full schema in `specs/001-data-pipeline-foundation/data-model.md`.
Fields used by `tree-loader.js`:

| Field | Used for |
|-------|---------|
| `id` | Node identity; profile link slug; synthetic node ID generation |
| `first_name`, `last_name` | Node label |
| `birth_date`, `death_date` | Node secondary label (year only) |
| `birth_place` | Tooltip |
| `father_id`, `mother_id` | Graph edge construction |

---

## Internal: Hierarchy Node

The output of `tree-loader.js` — consumed by `tree-renderer.js`.

```js
// d3.hierarchy node (d3's internal type, augmented with these .data fields)
{
  data: {
    id:          string,    // individual id OR "unknown-father-{id}" / "unknown-mother-{id}" / "__root__"
    first_name:  string,
    last_name:   string,
    birth_date:  string | null,
    death_date:  string | null,
    birth_place: string | null,
    isSynthetic: boolean,   // true for "?", "__root__" nodes
    isUnknown:   boolean,   // true for "?" nodes only (subset of isSynthetic)
  },
  // d3-standard fields set by d3.tree():
  x:        number,   // horizontal position (px in tree space)
  y:        number,   // vertical position (px in tree space, increases downward)
  parent:   HierarchyNode | null,
  children: HierarchyNode[] | null,
  depth:    number,
  height:   number,
}
```

---

## Internal: Virtualisation State

Managed by `tree-renderer.js`. Not serialised.

```js
{
  allNodes:    d3.Selection,   // all <g class="tree-node"> elements
  allEdges:    d3.Selection,   // all <path class="tree-edge"> elements
  transform:   d3.ZoomTransform, // current zoom/pan state
  nodeCount:   number,         // total node count (determines virtualisation threshold)
  THRESHOLD:   150,            // constant — virtualise above this count
}
```

---

## Synthetic Node ID Conventions

| Pattern | Meaning |
|---------|---------|
| `__root__` | Synthetic super-root (hidden from rendering) |
| `unknown-father-{child_id}` | Unknown father of individual `{child_id}` |
| `unknown-mother-{child_id}` | Unknown mother of individual `{child_id}` |

These IDs are generated deterministically from the child's `id` so they are stable
across pipeline runs. They MUST NOT appear in `data/individuals.json`.

---

## Mobile: Ancestor Chain

Produced by `tree-mobile.js`. Not serialised — computed on each search selection.

```js
// Ordered array from ego (index 0) to most distant known ancestor
[
  {
    id:         string,
    first_name: string,
    last_name:  string,
    birth_date: string | null,
    death_date: string | null,
    depth:      number,   // 0 = ego, 1 = parent, 2 = grandparent, ...
  },
  // ... up to maxDepth entries
]
```

`maxDepth` default: 6 generations. Beyond 6, a "Ver más antepasados" link is shown
pointing to the profile page of the most distant known ancestor found.
