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

import { syncData } from "./sync-data";
import { importData } from "./import-obsidian";
import { generateJson } from "./jsonGenerator";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  console.log("🚀 Starting build preparation...");
  const startTime = performance.now();

  try {
    // 1. Sync Data
    console.log("\n--- [1/3] Syncing Data ---");
    syncData();

    // 2. Import Data
    console.log("\n--- [2/3] Importing Content ---");
    // Hardcoded paths match the previous package.json configuration
    await importData({
      movesOut: "src/content/moves",
      conceptsOut: "src/content/concepts",
      obsidianData: "obsidian-data",
      force: force,
    });

    // 3. Generate JSON
    console.log("\n--- [3/3] Generating Search Index ---");
    generateJson(force);

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Build preparation complete in ${duration}s!`);
  } catch (error) {
    console.error("\n❌ Build preparation failed:");
    console.error(error);
    process.exit(1);
  }
}

main();
