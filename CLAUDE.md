# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DTU Salsa Wiki is an Astro-based static site that serves as a community-driven knowledge base for salsa moves and concepts. The project pulls content from an external Obsidian Vault (`dtu-salsa-data`) at build time, processes markdown files with frontmatter, resolves internal links, and generates search indices.

## Essential Commands

### Development

```bash
npm run dev                    # Syncs data, imports content, starts dev server at http://localhost:4321
npm run build                  # Syncs data, imports content, builds for production (output in dist/)
npm run preview                # Preview production build
```

### Testing

```bash
npm test                       # Run all tests using Node's test runner (tsx --test)
```

### Data Pipeline (rarely needed manually)

```bash
npm run prepare-data           # Orchestrates full pipeline: sync → import → generate JSON
npm run sync-data              # Clone/pull dtu-salsa-data repository
npm run import-obsidian -- --force  # Force re-import all data, ignoring cache
npm run generate-json          # Generate search indices (.json/moves.json, concepts.json, search.json)
```

## Architecture

### Content Pipeline

The project uses a **build-time content pipeline** orchestrated by `scripts/build/prepare.ts`:

1. **Data Sync** (`scripts/build/sync-data.ts`):
   - Clones or pulls `dtu-salsa-data` repository into `obsidian-data/`
   - Uses SSH for local dev, HTTPS with `DATA_REPO_TOKEN` env var for CI
   - Includes retry logic for transient network/lock failures

2. **Content Import** (`scripts/build/import-obsidian.ts`):
   - Processes markdown files from `obsidian-data/{Moves,Concepts}/`
   - Transforms Obsidian wikilinks (`[[Move Name]]`) to Astro-compatible slugs
   - Normalizes frontmatter (handles dates, arrays, relations)
   - Removes orphaned files (content deleted from source)
   - **Smart caching**: Tracks last imported commit hash in `.obsidian-import-cache` to skip unchanged imports
   - Outputs to `src/content/{moves,concepts}/`

3. **Search Index Generation** (`scripts/build/jsonGenerator.ts`):
   - Generates search indices for client-side search (minisearch)
   - Creates `.json/moves.json`, `.json/concepts.json`, `.json/search.json`
   - Optimized: skips if content hasn't changed

**Configuration**: Build pipeline config lives in `scripts/utils/constants.ts` and `scripts/types.ts`. All scripts accept a `BuildConfig` object with paths, git settings, and logger.

### Content Schema

Content is defined in `src/content.config.ts` using Astro's Content Collections API:

- **Moves Collection** (`src/content/moves/`):
  - Schema: `title`, `type` (partner/rueda/shine/solo/dip/trick), `difficulty`, `level`, `video_urls`, `aliases`, relations (`related_concepts`, `setup_moves`, `exit_moves`, `related_moves`)
  - Files imported from `obsidian-data/Moves/`

- **Concepts Collection** (`src/content/concepts/`):
  - Schema: `title`, `type` (hold/position/technique/musicality/finish), `level`, `video_urls`, relations
  - Files imported from `obsidian-data/Concepts/`

**Relations**: Use Astro's `reference()` helper for cross-references between collections. Links are resolved by slug.

### Key Directories

- `src/pages/`: Astro routing (index, 404, /moves/[...slug], /concepts/[...slug])
- `src/layouts/`: Layout components for pages
- `src/components/`: React/Astro components (UI elements, search)
- `src/lib/`: Utility functions and helpers
- `src/config/config.json`: Site configuration (title, base URL, PWA settings, etc.)
- `scripts/build/`: Build pipeline scripts (sync, import, JSON generation)
- `scripts/utils/`: Shared utilities (logger, constants, config)
- `tests/`: Integration and unit tests for import pipeline

## Important Implementation Notes

### Working with Content

- **DO NOT** manually edit files in `src/content/{moves,concepts}/` — they are auto-generated from `obsidian-data/` and will be overwritten
- To add/modify content, edit the upstream `dtu-salsa-data` repository
- When testing import logic, use `npm run import-obsidian -- --force` to ignore cache

### Testing

- Tests use Node's native test runner (`npx tsx --test`)
- Integration tests in `tests/import-obsidian.integration.test.ts` validate full pipeline
- Unit tests in `tests/import-obsidian.test.ts` test helpers in isolation

### Deployment

- **CI**: Netlify builds on push to `main` via `npm run build`
- **Auto-sync**: GitHub Action in `dtu-salsa-data` repo calls Netlify Build Hook when data changes
- **No commits on data changes**: The site rebuilds by fetching latest data; git history stays clean

### Search

- Client-side fuzzy search powered by `minisearch`
- Search indices generated in `.json/` at build time
- Supports aliases and keyboard shortcuts (Cmd+K / Ctrl+K)

### Styling

- Uses Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Configured in `astro.config.mjs`
- custom components in `src/components/ui/`
- dark mode support (theme switcher currently disabled in config.json)

## common patterns

### Modifying Content Schema

1. Update schema in `src/content.config.ts`
2. Ensure `scripts/build/import-obsidian.ts` handles new frontmatter fields
3. Update TypeScript types in `src/types/content.ts` if needed

### Debugging Import Issues

1. Check `.obsidian-import-cache` for last imported commit
2. Use `--force` flag to bypass cache: `npm run import-obsidian -- --force`
3. Inspect `obsidian-data/` to verify source files
4. Check logger output for transformation details

## Environment Variables

- `DATA_REPO_TOKEN`: GitHub personal access token for CI/CD (Netlify). Not needed for local development (uses SSH).
- `NODE_VERSION`: Specified in `netlify.toml` as `24.12.0`
