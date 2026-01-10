import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const OBSIDIAN_DATA_DIR = "obsidian-data";
const CACHE_FILE = path.resolve(process.cwd(), ".obsidian-import-cache");

export function checkChanges(foldersCheck: string[] = []): boolean {
  // 1. Get Current Commit
  const obsidianPath = path.resolve(process.cwd(), OBSIDIAN_DATA_DIR);
  if (!fs.existsSync(obsidianPath)) {
    console.error(`Error: ${OBSIDIAN_DATA_DIR} not found.`);
    return true;
  }

  let currentCommit = "";
  try {
    currentCommit = execSync("git rev-parse HEAD", {
      cwd: obsidianPath,
      encoding: "utf-8",
    }).trim();
  } catch (e) {
    // Fallback: If no git, assume changed
    return true;
  }

  // 2. Get Last Commit
  if (!fs.existsSync(CACHE_FILE)) {
    return true;
  }
  const lastCommit = fs.readFileSync(CACHE_FILE, "utf-8").trim();

  if (lastCommit === currentCommit) {
    return false;
  }

  // 3. Hashes differ. Check if we are filtering folders.
  if (foldersCheck.length === 0) {
    // No folders specified = check everything = Changed
    return true;
  }

  // 4. Check Diff for Specific Folders
  try {
    // Get list of changed files
    const diffOutput = execSync(
      `git diff --name-only ${lastCommit} ${currentCommit}`,
      {
        cwd: obsidianPath,
        encoding: "utf-8",
      },
    );

    const changedFiles = diffOutput.split("\n").filter(Boolean);

    const relevantChange = changedFiles.some((file) => {
      // Check if file is in one of the folders
      const inFolder = foldersCheck.some((folder) =>
        file.startsWith(folder + "/"),
      );
      if (!inFolder) return false;

      // Check if file starts with _ (ignore)
      const basename = path.basename(file);
      if (basename.startsWith("_")) return false;

      return true;
    });

    if (relevantChange) {
      return true;
    } else {
      // Differences exist but are not relevant (e.g. ignored files or outside folders)
      // Update cache to avoid re-checking these irrelevant diffs
      fs.writeFileSync(CACHE_FILE, currentCommit);
      return false;
    }
  } catch (e) {
    console.warn("Error checking diff, assuming changed.");
    return true;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const foldersCheck = process.argv.slice(2);
  const hasChanged = checkChanges(foldersCheck);
  console.log(hasChanged ? "CHANGED" : "NO_CHANGE");
}
