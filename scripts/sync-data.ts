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

const DATA_DIR = "obsidian-data";
const REPO_SSH = "git@github.com:andrezz-b/dtu-salsa-data.git";

function getRepoUrl(): string {
  const token = process.env.DATA_REPO_TOKEN;
  if (token) {
    // Use HTTPS with token for CI
    return `https://${token}@github.com/andrezz-b/dtu-salsa-data.git`;
  }
  // Use SSH for local development
  return REPO_SSH;
}

function run(cmd: string, cwd?: string): void {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

function main(): void {
  const dataPath = path.resolve(process.cwd(), DATA_DIR);
  const repoUrl = getRepoUrl();

  if (fs.existsSync(dataPath)) {
    // Directory exists - pull latest
    console.log(`📦 Updating ${DATA_DIR}...`);
    try {
      run("git fetch --depth 1 origin main", dataPath);
      run("git reset --hard origin/main", dataPath);
    } catch (e) {
      console.warn("⚠️ Pull failed, re-cloning...");
      fs.rmSync(dataPath, { recursive: true, force: true });
      run(`git clone --depth 1 ${repoUrl} ${DATA_DIR}`);
    }
  } else {
    // Directory doesn't exist - clone
    console.log(`📦 Cloning ${DATA_DIR}...`);
    run(`git clone --depth 1 ${repoUrl} ${DATA_DIR}`);
  }

  console.log("✅ Data sync complete.");
}

main();
