/**
 * check-changes.ts
 *
 * Checks if there are relevant changes in the obsidian-data repo
 * compared to the last imported commit.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PATHS } from "../utils/constants.js";
import { log } from "../utils/logger.js";

const CACHE_FILE = path.resolve(process.cwd(), PATHS.CACHE_FILE);

export interface ChangeCheckResult {
  hasChanges: boolean;
  currentCommit: string;
  /** If true, caller should update the cache file after processing */
  shouldUpdateCache: boolean;
}

/**
 * Check if a git commit exists in the repository.
 * Returns false for shallow clones where history is missing.
 */
function commitExists(hash: string, cwd: string): boolean {
  try {
    execSync(`git cat-file -e ${hash}`, { cwd, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current HEAD commit hash.
 */
function getCurrentCommit(cwd: string): string | null {
  try {
    return execSync("git rev-parse HEAD", { cwd, encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

/**
 * Check for changes in the obsidian-data repository.
 *
 * @param foldersCheck - Limit change detection to specific folders (e.g., ["Moves", "Concepts"])
 * @returns ChangeCheckResult with change status and metadata
 */
export function checkChanges(foldersCheck: string[] = []): ChangeCheckResult {
  const obsidianPath = path.resolve(process.cwd(), PATHS.OBSIDIAN_DATA);

  // 1. Verify obsidian-data exists
  if (!fs.existsSync(obsidianPath)) {
    log.warn(`${PATHS.OBSIDIAN_DATA} not found.`);
    return { hasChanges: true, currentCommit: "", shouldUpdateCache: false };
  }

  // 2. Get current commit
  const currentCommit = getCurrentCommit(obsidianPath);
  if (!currentCommit) {
    log.warn("Failed to get current commit, assuming changes.");
    return { hasChanges: true, currentCommit: "", shouldUpdateCache: false };
  }

  // 3. Get last imported commit from cache
  if (!fs.existsSync(CACHE_FILE)) {
    log.info("No cache file found. First import.");
    return { hasChanges: true, currentCommit, shouldUpdateCache: true };
  }

  const lastCommit = fs.readFileSync(CACHE_FILE, "utf-8").trim();

  // 4. Quick check: same commit = no changes
  if (lastCommit === currentCommit) {
    return { hasChanges: false, currentCommit, shouldUpdateCache: false };
  }

  // 5. Verify the last commit exists in history (may be missing in shallow clone)
  if (!commitExists(lastCommit, obsidianPath)) {
    log.info(
      "Previous commit not in history (shallow clone). Running full import.",
    );
    return { hasChanges: true, currentCommit, shouldUpdateCache: true };
  }

  // 6. If no folder filter, any difference = changes
  if (foldersCheck.length === 0) {
    return { hasChanges: true, currentCommit, shouldUpdateCache: true };
  }

  // 7. Check diff for specific folders
  try {
    const diffOutput = execSync(
      `git diff --name-only ${lastCommit} ${currentCommit}`,
      { cwd: obsidianPath, encoding: "utf-8" },
    );

    const changedFiles = diffOutput.split("\n").filter(Boolean);

    const relevantChange = changedFiles.some((file) => {
      // Check if file is in one of the monitored folders
      const inFolder = foldersCheck.some((folder) =>
        file.startsWith(folder + "/"),
      );
      if (!inFolder) return false;

      // Ignore files starting with underscore
      const basename = path.basename(file);
      if (basename.startsWith("_")) return false;

      return true;
    });

    if (relevantChange) {
      return { hasChanges: true, currentCommit, shouldUpdateCache: true };
    } else {
      // Changes exist but are not relevant to monitored folders
      return { hasChanges: false, currentCommit, shouldUpdateCache: true };
    }
  } catch (e) {
    log.warn("Error checking diff, assuming changed.");
    return { hasChanges: true, currentCommit, shouldUpdateCache: true };
  }
}

/**
 * Update the cache file with the given commit hash.
 */
export function updateCache(commit: string): void {
  if (commit) {
    fs.writeFileSync(CACHE_FILE, commit);
  }
}

/**
 * Legacy function for backward compatibility.
 * Returns just a boolean like the old API.
 */
export function hasChanges(foldersCheck: string[] = []): boolean {
  const result = checkChanges(foldersCheck);
  // Automatically update cache for irrelevant changes (preserves old behavior)
  if (!result.hasChanges && result.shouldUpdateCache) {
    updateCache(result.currentCommit);
  }
  return result.hasChanges;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const foldersCheck = process.argv.slice(2);
  const result = checkChanges(foldersCheck);
  console.log(result.hasChanges ? "CHANGED" : "NO_CHANGE");
}
