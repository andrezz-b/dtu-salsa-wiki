import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ContentItem, BaseFrontmatter } from "../src/types/content";

const CONTENT_DEPTH = 2;
const JSON_FOLDER = "./.json";

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

export function generateJson(force = false) {
  try {
    // Create folder if it doesn't exist
    if (!fs.existsSync(JSON_FOLDER)) {
      fs.mkdirSync(JSON_FOLDER);
    }

    // Check if update is needed
    const outputFiles = ["moves.json", "concepts.json", "search.json"].map(
      (f) => path.join(JSON_FOLDER, f),
    );

    const outputsExist = outputFiles.every((f) => fs.existsSync(f));

    let shouldRun = !outputsExist || force;

    if (outputsExist && !force) {
      const oldestOutputMtime = Math.min(
        ...outputFiles.map((f) => fs.statSync(f).mtimeMs),
      );
      const latestContentMtime = Math.max(
        getLatestMtime("src/content/moves"),
        getLatestMtime("src/content/concepts"),
      );

      if (latestContentMtime > oldestOutputMtime) {
        shouldRun = true;
      } else {
        console.log("JSONs are up to date. Skipping generation.");
      }
    }

    if (shouldRun) {
      console.log("Generating JSON files...");
      // Create json files
      const moves = getData("src/content/moves", 2);
      const concepts = getData("src/content/concepts", 2);

      fs.writeFileSync(`${JSON_FOLDER}/moves.json`, JSON.stringify(moves));
      fs.writeFileSync(
        `${JSON_FOLDER}/concepts.json`,
        JSON.stringify(concepts),
      );

      // Merge json files for search
      const search = [...moves, ...concepts];
      fs.writeFileSync(`${JSON_FOLDER}/search.json`, JSON.stringify(search));
      console.log("JSON generation complete.");
    }
  } catch (err) {
    console.error(err);
  }
}

import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  generateJson(force);
}
