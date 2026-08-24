# Graph Report - fenix-construcciones  (2026-08-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 82 nodes · 74 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cbaf4da3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- compilerOptions
- dependencies
- include
- package.json
- layout.tsx
- lib
- route.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `include` - 7 edges
3. `scripts` - 5 edges
4. `lib` - 4 edges
5. `eslint` - 2 edges
6. `eslint-config-next` - 2 edges
7. `tailwindcss` - 2 edges
8. `@tailwindcss/postcss` - 2 edges
9. `@types/node` - 2 edges
10. `@types/react` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (12 total, 4 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 1 - "compilerOptions"
Cohesion: 0.13
Nodes (15): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, module, moduleResolution (+7 more)

### Community 2 - "dependencies"
Cohesion: 0.18
Nodes (11): next, dependencies, next, qrcode.react, react, react-dom, resend, qrcode.react (+3 more)

### Community 3 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 4 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 5 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 6 - "lib"
Cohesion: 0.50
Nodes (4): dom, dom.iterable, esnext, lib

## Knowledge Gaps
- **51 isolated node(s):** `eslint`, `eslint-config-next`, `tailwindcss`, `@tailwindcss/postcss`, `@types/node` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `compilerOptions` to `include`, `lib`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `eslint`, `eslint-config-next`, `tailwindcss` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._