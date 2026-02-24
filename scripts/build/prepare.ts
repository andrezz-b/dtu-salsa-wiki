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
import { log } from "../utils/logger.js";
import { DefaultConfig } from "scripts/utils/config.js";
import { hasChanges, updateCacheWithCurrentCommit } from "./check-changes.js";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  const startTime = performance.now();
  const config = DefaultConfig;
  const logger = config.logger;
  logger.info("🚀 Starting build preparation...");

  try {
    // 1. Sync Data
    log.step(1, 3, "Syncing Data");
    await syncData(config);

    // 2. Import Data
    const hasChangesResult = hasChanges(config.CONTENT_FOLDERS);
    log.step(2, 3, "Importing Content");
    if (hasChangesResult || force) {
      await importData(
        {
          force: force,
        },
        config,
      );
      updateCacheWithCurrentCommit(config.PATHS.OBSIDIAN_DATA);
    } else {
      logger.skip("No changes detected in content folders. Skipping import.");
    }

    // 3. Generate JSON
    log.step(3, 3, "Generating Search Index");
    generateJson(force, config);

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Build preparation complete in ${duration}s!`);
  } catch (error) {
    log.error("Build preparation failed:");
    console.error(error);
    process.exit(1);
  }
}

main();
