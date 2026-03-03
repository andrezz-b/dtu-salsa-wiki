import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  ContentItem,
  BaseFrontmatter,
  MoveFrontmatter,
  ConceptFrontmatter,
} from "../../src/types/content";

const CONTENT_DEPTH = 2;

/**
 * Get data from markdown files in a folder
 */
const getData = <T extends BaseFrontmatter>(
  folder: string,
  groupDepth: number,
): ContentItem<T>[] => {
  const getPath = fs.readdirSync(folder);
  const removeIndex = getPath.filter((item) => !item.startsWith("-"));

  const getPaths = removeIndex.flatMap((filename): ContentItem<T>[] => {
    const filepath = path.join(folder, filename);
    const stats = fs.statSync(filepath);
    const isFolder = stats.isDirectory();

    if (isFolder) {
      return getData<T>(filepath, groupDepth);
    } else if (filename.endsWith(".md") || filename.endsWith(".mdx")) {
      const file = fs.readFileSync(filepath, "utf-8");
      const { data, content } = matter(file);
      const pathParts = filepath.split(path.sep);
      const slug =
        (data.slug as string) ||
        pathParts
          .slice(CONTENT_DEPTH)
          .join("/")
          .replace(/\.[^/.]+$/, "");
      const group = pathParts[groupDepth];

      return [
        {
          group: group,
          slug: slug,
          frontmatter: data as T,
          content: content,
        },
      ];
    } else {
      return [];
    }
  });

  return getPaths.filter((page) => page.frontmatter && !page.frontmatter.draft);
};

const getLatestMtime = (folder: string): number => {
  let maxTime = 0;
  if (!fs.existsSync(folder)) return 0;

  const files = fs.readdirSync(folder);
  for (const file of files) {
    const filepath = path.join(folder, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      maxTime = Math.max(maxTime, getLatestMtime(filepath));
    } else {
      maxTime = Math.max(maxTime, stats.mtimeMs);
    }
  }
  return maxTime;
};

export const generateJson: TaskFunction<[boolean], void> = (
  force = false,
  config,
) => {
  const logger = config.logger;
  try {
    // Create folder if it doesn't exist
    if (!fs.existsSync(config.PATHS.JSON_FOLDER)) {
      fs.mkdirSync(config.PATHS.JSON_FOLDER);
    }

    // Check if update is needed
    const outputFiles = ["moves.json", "concepts.json", "search.json"].map(
      (f) => path.join(config.PATHS.JSON_FOLDER, f),
    );

    const outputsExist = outputFiles.every((f) => fs.existsSync(f));

    let shouldRun = !outputsExist || force;

    if (outputsExist && !force) {
      const oldestOutputMtime = Math.min(
        ...outputFiles.map((f) => fs.statSync(f).mtimeMs),
      );
      const latestContentMtime = Math.max(
        getLatestMtime(config.PATHS.CONTENT_MOVES),
        getLatestMtime(config.PATHS.CONTENT_CONCEPTS),
      );

      if (latestContentMtime > oldestOutputMtime) {
        shouldRun = true;
      } else {
        logger.skip("JSONs are up to date. Skipping generation.");
      }
    }

    if (shouldRun) {
      logger.info("Generating JSON files...");
      // Create json files with explicit type arguments
      const moves = getData<MoveFrontmatter>(config.PATHS.CONTENT_MOVES, 2);
      const concepts = getData<ConceptFrontmatter>(
        config.PATHS.CONTENT_CONCEPTS,
        2,
      );

      fs.writeFileSync(
        path.join(config.PATHS.JSON_FOLDER, "moves.json"),
        JSON.stringify(moves),
      );
      fs.writeFileSync(
        path.join(config.PATHS.JSON_FOLDER, "concepts.json"),
        JSON.stringify(concepts),
      );

      // Merge json files for search
      const search = [...moves, ...concepts];
      fs.writeFileSync(
        path.join(config.PATHS.JSON_FOLDER, "search.json"),
        JSON.stringify(search),
      );
      logger.success("JSON generation complete.");
    }
  } catch (err) {
    logger.error(`JSON generation failed: ${err}`);
    throw err;
  }
};

import { fileURLToPath } from "node:url";
import type { TaskFunction } from "scripts/types.js";
import { getConfigFromCli } from "scripts/utils/cli-config.js";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { config, force } = getConfigFromCli();
  generateJson(force, config);
}
