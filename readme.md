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

This project pulls content from an external **Obsidian Vault** (`dtu-salsa-data`). The data flows as follows:

### 1. 📥 Data Import

Code in `scripts/` handles importing content from the `obsidian-data` submodule into `src/content`.

- **`scripts/import-obsidian.ts`**: The main driver. It reads content from `obsidian-data/Moves` and `obsidian-data/Concepts`, transforms frontmatter, resolves internal links (`[[Link]]`), and populates `src/content/moves` and `src/content/concepts`.
- **`scripts/check-changes.ts`**: Optimizes the build process by checking if the submodule commit has changed since the last import. It prevents redundant processing if the data is already up-to-date.

### 2. 🤖 Auto-Deploy Trigger

We use **GitHub Actions** to keep the wiki synchronized with the Obsidian data:

1.  **Push to Data Repo**: When changes are committed to `dtu-salsa-data`.
2.  **Dispatch Event**: A workflow in the data repo triggers a `repository_dispatch` event in this repository.
3.  **Update Submodule**: The `.github/workflows/update-data.yml` workflow runs here. It updates the `obsidian-data` submodule to the latest commit and pushes the update to `main`.
4.  **Netlify Build**: Netlify detects the commit (which includes the updated submodule reference) and rebuilds the site with the new data.

### 3. 👨‍💻 For Developers

When running locally:

- **`npm run dev`**: Automatically runs the import script before starting the server. If `obsidian-data` hasn't changed, the import is skipped for speed.
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
