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
- npm or yarn

### 👉 Install Dependencies

```bash
npm install
# or
yarn install
```

### 👉 Development

Start the development server:

```bash
npm run dev
# or
yarn run dev
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
