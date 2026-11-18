# Japan SWE Internship Roadmap

Personal interactive learning roadmap for preparing for the **HENNGE Global Internship Program (Full-Stack)** and **Mercari Software Engineer Internship**.

## Local Development

```bash
npm install
npm run dev      # Start Vite dev server
npm test         # Run Vitest unit tests
npm run build    # Type-check and build static bundle into dist/
```

## How to Add or Edit Roadmap Nodes

All roadmap topics live in [`src/data/nodes.ts`](src/data/nodes.ts). Layout coordinates and edges are computed automatically in [`src/utils/layout.ts`](src/utils/layout.ts)—you do not need to calculate `x`/`y` positions manually.

### Adding a Main Spine Topic
Add an object to `ROADMAP_NODES` with `kind: 'main'`:

```ts
{
  id: 'graphql-basics',
  title: 'GraphQL Basics',
  kind: 'main',
  track: 'shared',           // 'shared' | 'hennge' | 'mercari'
  targets: ['H', 'M'],       // Renders H and M badges
  section: 'Languages & Data',
  order: 95,                 // Controls vertical position on the central spine
  description: 'Queries, mutations, schema design, and N+1 prevention.',
  whyItMatters: 'Useful for modern API design.',
  requirementIds: ['hennge-fullstack'],
  estimatedHours: 8,
  resources: [
    { title: 'GraphQL Learn', url: 'https://graphql.org/learn/', type: 'docs' },
  ],
}
```

### Adding a Subtopic or Optional Branch
Set `parentId` to a `main` node's `id` and `kind: 'subtopic'` (solid border) or `kind: 'optional'` (dashed border). Optionally set `side: 'left' | 'right'` (defaults to alternating left/right):

```ts
{
  id: 'docker-security',
  title: 'Non-root Containers',
  kind: 'optional',
  track: 'shared',
  targets: ['H', 'M'],
  section: 'Cloud & DevOps',
  parentId: 'docker',
  side: 'left',
  order: 1,
  description: 'Running containers as non-root users and scanning images.',
  whyItMatters: 'Good production hygiene.',
  requirementIds: ['hennge-docker'],
  resources: [],
}
```

### Editing Requirements
Official internship requirements live in [`src/data/requirements.ts`](src/data/requirements.ts). Link any node by adding its `id` to `nodeIds`.

---

## Static Deployment

### Option A: Vercel (Recommended)
1. Push this repo to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Framework preset: **Vite** (`npm run build`, output directory `dist`).
4. Deploy.

### Option B: GitHub Pages
1. In [`vite.config.ts`](vite.config.ts), change `base: '/'` to `base: '/<your-repo-name>/'` (unless deploying to `<username>.github.io`).
2. Build and publish `dist/` using GitHub Actions or `gh-pages`:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```
3. In your GitHub repo **Settings → Pages**, set the source to the `gh-pages` branch.
