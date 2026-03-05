import type { log } from "./utils/logger";

export interface BuildConfig {
  PATHS: {
    /** Directory where obsidian-data repo is cloned */
    OBSIDIAN_DATA: string;
    /** Cache file tracking last imported commit */
    CACHE_FILE: string;
    /** Directory for generated JSON files */
    JSON_FOLDER: string;
    /** Output directory for processed moves */
    CONTENT_MOVES: string;
    /** Output directory for processed concepts */
    CONTENT_CONCEPTS: string;
  };
  GIT: {
    /** SSH URL for local development */
    REPO_SSH: string;
    /** HTTPS URL template (token inserted at runtime) */
    REPO_HTTPS_TEMPLATE: string;
    /** Environment variable name for CI token */
    TOKEN_ENV_VAR: string;
  };
  CONTENT_FOLDERS: string[];
  logger: typeof log;
}

export type TaskFunction<A extends any[] = [], R = void> = (
  ...args: [...A, config: BuildConfig]
) => Promise<R> | R;
