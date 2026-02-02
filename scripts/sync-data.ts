/**
 * sync-data.ts
 *
 * Fetches the obsidian-data repository at build time.
 * - If obsidian-data/ exists: pulls latest changes
 * - If not exists: clones the repository (shallow clone for speed)
 *
 * Supports DATA_REPO_TOKEN env var for CI authentication (HTTPS).
 * Falls back to SSH for local development.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PATHS, GIT } from "./constants.js";
import { log, sleep } from "./logger.js";

function getRepoUrl(): string {
  const token = process.env[GIT.TOKEN_ENV_VAR];
  if (token) {
    // Use HTTPS with token for CI
    return `https://${token}@github.com/andrezz-b/dtu-salsa-data.git`;
  }
  // Use SSH for local development
  return GIT.REPO_SSH;
}

function run(cmd: string, cwd?: string): void {
  log.cmd(cmd);
  execSync(cmd, { cwd, stdio: "inherit" });
}

/**
 * Run a command with exponential backoff retry for transient failures.
 */
async function runWithRetry(
  cmd: string,
  cwd?: string,
  maxRetries = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      run(cmd, cwd);
      return;
    } catch (e) {
      if (attempt === maxRetries) throw e;
      const delay = 1000 * Math.pow(2, attempt - 1);
      log.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

/**
 * Remove a directory with retry for transient file lock issues (Windows/IDE).
 */
function rmWithRetry(dir: string, retries = 3): void {
  for (let i = 0; i < retries; i++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (e: any) {
      if (i === retries - 1) throw e;
      if (e.code === "EBUSY" || e.code === "ENOTEMPTY") {
        // Brief synchronous delay before retry
        const start = Date.now();
        while (Date.now() - start < 200) {
          /* spin */
        }
      }
    }
  }
}

export async function syncData(): Promise<void> {
  const dataPath = path.resolve(process.cwd(), PATHS.OBSIDIAN_DATA);
  const repoUrl = getRepoUrl();

  if (fs.existsSync(dataPath)) {
    // Directory exists - pull latest
    log.info(`Updating ${PATHS.OBSIDIAN_DATA}...`);
    try {
      await runWithRetry("git fetch --depth 1 origin main", dataPath);
      run("git reset --hard origin/main", dataPath);
      run("git clean -fd", dataPath); // Remove untracked files
    } catch (e) {
      log.warn("Pull failed, re-cloning...");
      rmWithRetry(dataPath);
      await runWithRetry(
        `git clone --depth 1 ${repoUrl} ${PATHS.OBSIDIAN_DATA}`,
      );
    }
  } else {
    // Directory doesn't exist - clone
    log.info(`Cloning ${PATHS.OBSIDIAN_DATA}...`);
    await runWithRetry(`git clone --depth 1 ${repoUrl} ${PATHS.OBSIDIAN_DATA}`);
  }

  log.success("Data sync complete.");
}

import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncData();
}
