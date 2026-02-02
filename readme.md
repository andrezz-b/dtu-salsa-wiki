# DTU Salsa Wiki

A community-driven knowledge base for salsa moves and concepts, built for the DTU Salsa community.

## 📌 Key Features

- **📚 Comprehensive Library:** A growing collection of Salsa moves and concepts, categorized by level and type.
- **🔍 Fast Search:** Instant client-side fuzzy search powered by `minisearch`, with support for aliases and keyboard shortcuts (`Cmd+K` / `Ctrl+K`).
- **📱 Mobile-First:** Fully responsive design that looks great on all devices, from phones to desktops.
- **🌓 Dark Mode:** Built-in dark mode support for comfortable reading in any environment.
- **⚡ High Performance:** Built with Astro for lightning-fast page loads and optimal SEO.
- **📝 Easy Content Management:** Integrated with Decap CMS for easy content updates and additions.
- **🏷️ Organized Content:** Robust tagging and categorization system to help you find exactly what you're looking for.

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Search:** [Minisearch](https://lucaong.github.io/minisearch/)
- **CMS:** [Decap CMS](https://decapcms.org/)

## 🚀 Getting Started

### 📦 Prerequisites

- Node.js v20.10+
- npm

### 👉 Install Dependencies

```bash
npm install
```

### 👉 Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:4321` to see the site.

### 👉 Build

Build the project for production:

```bash
npm run build
# or
yarn run build
```

The output will be in the `dist/` directory.

## 🔄 Sync & Import Workflow

This project pulls content from an external **Obsidian Vault** (`dtu-salsa-data`). The data is fetched at build time—no git submodule management required.

### 1. 📥 Data Sync & Import

Scripts in `scripts/` handle fetching and importing content, orchestrated by **`scripts/prepare.ts`**:

- **`scripts/prepare.ts`**: The main entry point. Runs `sync-data`, `import-obsidian`, and `generateJson` in sequence.
- **`scripts/sync-data.ts`**: Clones or pulls the latest `dtu-salsa-data` repository into `obsidian-data/`.
- **`scripts/import-obsidian.ts`**: Imports Markdown files, resolves links, and cleans up orphans.
- **`scripts/jsonGenerator.ts`**: Generates search indices. Optimizes by skipping if content hasn't changed.
- **`scripts/check-changes.ts`**: Used internally by the import script to skip processing if `obsidian-data` hasn't changed.

### 2. 🤖 Auto-Deploy Trigger

The deployment flow is simple and decoupled:

1.  **Push to Data Repo**: When changes are committed to `dtu-salsa-data`.
2.  **Netlify Build Hook**: A GitHub Action in the data repo calls a Netlify Build Hook URL.
3.  **Netlify Build**: Netlify runs `npm run build`, which fetches the latest data and rebuilds the site.

> **Note**: No commits are made to this repository when data changes—the git history stays clean.

### 3. 👨‍💻 For Developers

Just run the standard commands—data fetching is automatic:

- **`npm run dev`**: Syncs data, imports content, and starts the dev server.
- **`npm run build`**: Syncs data, imports content, and builds for production.
- **`npm run import-obsidian -- --force`**: Forces a re-import of all data, ignoring the cache.

## 📂 Project Structure

- `src/content/`: Markdown/MDX files for moves and concepts.
- `src/layouts/`: Astro layouts and components.
- `src/pages/`: Astro pages and routing.
- `src/lib/`: Utility functions and helpers.
- `public/`: Static assets and CMS configuration.

## 🤝 Contributing

We welcome contributions! You can contribute by:

1.  **Adding Content:** Use the `/admin` interface (Decap CMS) to add new moves or concepts.
2.  **Improving Code:** Fork the repository, make changes, and submit a pull request.
3.  **Reporting Issues:** Open an issue on GitHub if you find a bug or have a feature request.
