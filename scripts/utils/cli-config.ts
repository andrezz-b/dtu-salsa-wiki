/**
 * cli-config.ts
 *
 * Utility for composing BuildConfig from CLI arguments and default config.
 * Follows DRY principle by centralizing CLI argument parsing and config merging.
 */

import type { BuildConfig } from "../types.js";
import { DefaultConfig } from "./config.js";

export interface CliConfigOptions {
  /** Override obsidian-data path */
  "--obsidian-data"?: string;
  /** Override moves output path */
  "--moves-out"?: string;
  /** Override concepts output path */
  "--concepts-out"?: string;
  /** Override JSON folder path */
  "--json-folder"?: string;
  /** Override cache file path */
  "--cache-file"?: string;
  /** Force flag */
  "--force"?: boolean;
}

/**
 * Parse CLI arguments into a structured options object
 */
export function parseCliArgs(args: string[]): CliConfigOptions {
  const options: CliConfigOptions = {};

  const getArg = (name: string): string | undefined => {
    const index = args.indexOf(name);
    if (index !== -1 && index + 1 < args.length) return args[index + 1];
    return undefined;
  };

  const obsidianData = getArg("--obsidian-data");
  if (obsidianData) options["--obsidian-data"] = obsidianData;

  const movesOut = getArg("--moves-out");
  if (movesOut) options["--moves-out"] = movesOut;

  const conceptsOut = getArg("--concepts-out");
  if (conceptsOut) options["--concepts-out"] = conceptsOut;

  const jsonFolder = getArg("--json-folder");
  if (jsonFolder) options["--json-folder"] = jsonFolder;

  const cacheFile = getArg("--cache-file");
  if (cacheFile) options["--cache-file"] = cacheFile;

  if (args.includes("--force")) {
    options["--force"] = true;
  }

  return options;
}

/**
 * Compose a BuildConfig by merging CLI options with the default config.
 * CLI arguments take precedence over defaults.
 */
export function composeConfig(
  cliOptions: CliConfigOptions,
  baseConfig: BuildConfig = DefaultConfig,
): BuildConfig {
  return {
    ...baseConfig,
    PATHS: {
      ...baseConfig.PATHS,
      ...(cliOptions["--obsidian-data"] && {
        OBSIDIAN_DATA: cliOptions["--obsidian-data"],
      }),
      ...(cliOptions["--moves-out"] && {
        CONTENT_MOVES: cliOptions["--moves-out"],
      }),
      ...(cliOptions["--concepts-out"] && {
        CONTENT_CONCEPTS: cliOptions["--concepts-out"],
      }),
      ...(cliOptions["--json-folder"] && {
        JSON_FOLDER: cliOptions["--json-folder"],
      }),
      ...(cliOptions["--cache-file"] && {
        CACHE_FILE: cliOptions["--cache-file"],
      }),
    },
  };
}

/**
 * Convenience function to parse args and compose config in one call
 */
export function getConfigFromCli(
  args: string[] = process.argv.slice(2),
  baseConfig: BuildConfig = DefaultConfig,
): { config: BuildConfig; force: boolean } {
  const cliOptions = parseCliArgs(args);
  const config = composeConfig(cliOptions, baseConfig);
  const force = cliOptions["--force"] ?? false;

  return { config, force };
}
