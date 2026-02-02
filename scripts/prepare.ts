/**
 * prepare.ts
 *
 * Orchestrator script for the build preparation pipeline.
 * Runs conceptually "before" the main app logic (dev or build).
 *
 * Pipeline:
 * 1. Sync Data (git clone/pull)
 * 2. Import Data (process markdown, resolve links, cleanup orphans)
 * 3. Generate JSON (for search index)
 */

import { syncData } from "./sync-data.js";
import { importData } from "./import-obsidian.js";
import { generateJson } from "./jsonGenerator.js";
import { PATHS } from "./constants.js";
import { log } from "./logger.js";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  console.log("🚀 Starting build preparation...");
  const startTime = performance.now();

  try {
    // 1. Sync Data
    log.step(1, 3, "Syncing Data");
    await syncData();

    // 2. Import Data
    log.step(2, 3, "Importing Content");
    await importData({
      movesOut: PATHS.CONTENT_MOVES,
      conceptsOut: PATHS.CONTENT_CONCEPTS,
      obsidianData: PATHS.OBSIDIAN_DATA,
      force: force,
    });

    // 3. Generate JSON
    log.step(3, 3, "Generating Search Index");
    generateJson(force);

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Build preparation complete in ${duration}s!`);
  } catch (error) {
    log.error("Build preparation failed:");
    console.error(error);
    process.exit(1);
  }
}

main();
