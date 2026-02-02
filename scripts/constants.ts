/**
 * Shared constants for build pipeline scripts.
 */

export const PATHS = {
  /** Directory where obsidian-data repo is cloned */
  OBSIDIAN_DATA: "obsidian-data",
  /** Cache file tracking last imported commit */
  CACHE_FILE: ".obsidian-import-cache",
  /** Directory for generated JSON files */
  JSON_FOLDER: ".json",
  /** Output directory for processed moves */
  CONTENT_MOVES: "src/content/moves",
  /** Output directory for processed concepts */
  CONTENT_CONCEPTS: "src/content/concepts",
} as const;

export const GIT = {
  /** SSH URL for local development */
  REPO_SSH: "git@github.com:andrezz-b/dtu-salsa-data.git",
  /** HTTPS URL template (token inserted at runtime) */
  REPO_HTTPS_TEMPLATE:
    "https://{TOKEN}@github.com/andrezz-b/dtu-salsa-data.git",
  /** Environment variable name for CI token */
  TOKEN_ENV_VAR: "DATA_REPO_TOKEN",
} as const;

/** Folders in obsidian-data that contain content */
export const CONTENT_FOLDERS = ["Moves", "Concepts"] as const;
