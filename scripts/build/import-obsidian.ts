import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Slugger from "github-slugger";
import fsp from "node:fs/promises";

// Types
export interface ObsidianFrontmatter {
  tags?: string[];
  aliases?: string[];
  related_concepts?: string[];
  related_moves?: string[];
  setup_moves?: string[];
  exit_moves?: string[];
  created_date?: string;
  updated_date?: string;
  video_url?: string;
  video_urls?: string[];
  [key: string]: any;
}
const ContentType = {
  MOVE: "move",
  CONCEPT: "concept",
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];
export interface FileInfo {
  originalTitle: string;
  slug: string;
  type: ContentType;
  path: string;
  variations: string[];
}

// Helpers
export const slugger = new Slugger();
export const generateSlug = (title: string) => slugger.slug(title);

export const parseObsidianDate = (val: any): Date | undefined => {
  if (val instanceof Date) return val;
  if (typeof val !== "string") return undefined;

  try {
    const [datePart, timePart] = val.split(", ");
    if (!datePart || !timePart) return undefined;
    const [hours, minutes] = timePart.split(":");
    const paddedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    const date = new Date(`${datePart}T${paddedTime}`);
    if (isNaN(date.getTime())) return undefined;
    return date;
  } catch (e) {
    return undefined;
  }
};

export const cleanFrontmatter = (obj: any): any => {
  if (obj instanceof Date) return obj; // Preserve Date objects
  if (Array.isArray(obj)) {
    const cleaned = obj
      .map(cleanFrontmatter)
      .filter((item) => item !== null && item !== undefined && item !== "");
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof obj === "object" && obj !== null) {
    const cleanedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanFrontmatter(value);
      if (cleanedValue !== undefined && cleanedValue !== null) {
        cleanedObj[key] = cleanedValue;
      }
    }
    return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
  }
  return obj;
};

export const normalizeRelationItems = (items: any[]): string[] => {
  const result: string[] = [];
  for (const item of items) {
    let itemStr = item;
    while (Array.isArray(itemStr)) {
      if (itemStr.length > 0) itemStr = itemStr[0];
      else {
        itemStr = undefined;
        break;
      }
    }

    if (typeof itemStr === "string") {
      result.push(itemStr);
    }
  }
  return result;
};

const validateImportExportFolders = async ({
  PATHS,
  CONTENT_FOLDERS,
}: BuildConfig) => {
  if (!fs.existsSync(PATHS.OBSIDIAN_DATA)) {
    throw new Error(
      `Obsidian data directory not found at ${PATHS.OBSIDIAN_DATA}.`,
    );
  }

  for (const folder of CONTENT_FOLDERS) {
    const contentPath = path.join(PATHS.OBSIDIAN_DATA, folder);
    if (!fs.existsSync(contentPath)) {
      throw new Error(
        `Required folder "${folder}" not found in ${PATHS.OBSIDIAN_DATA}.`,
      );
    }

    const stat = await fsp.stat(contentPath);
    if (!stat.isDirectory()) {
      throw new Error(
        `Expected "${folder}" to be a directory in ${PATHS.OBSIDIAN_DATA}.`,
      );
    }
  }

  if (!fs.existsSync(PATHS.CONTENT_MOVES))
    await fsp.mkdir(PATHS.CONTENT_MOVES, { recursive: true });
  if (!fs.existsSync(PATHS.CONTENT_CONCEPTS))
    await fsp.mkdir(PATHS.CONTENT_CONCEPTS, { recursive: true });
};

const getContentTitleInfoMap = async (
  contentConfigs: Array<{ folder: string; contentType: ContentType }>,
): Promise<Map<string, FileInfo>> => {
  const map = new Map<string, FileInfo>();

  for (const { folder, contentType } of contentConfigs) {
    const files = await fsp.readdir(folder, {
      withFileTypes: true,
    });
    for (const file of files) {
      const nestedFiles = file.isDirectory()
        ? await fsp.readdir(path.join(folder, file.name))
        : [file.name];
      const basePath = file.isDirectory()
        ? path.join(folder, file.name)
        : folder;
      const variaitons = [];
      for (const nestedFile of nestedFiles) {
        if (!nestedFile.endsWith(".md")) continue;
        const filePath = path.join(basePath, nestedFile);
        const originalTitle = path.basename(nestedFile, ".md");
        const slug = generateSlug(originalTitle);
        variaitons.push({ originalTitle, slug });
        map.set(originalTitle, {
          originalTitle,
          slug,
          type: contentType,
          path: filePath,
          variations: [],
        });
      }
      for (const [index, variation] of variaitons.entries()) {
        let item = map.get(variation.originalTitle);
        item!.variations = variaitons.toSpliced(index, 1).map((i) => i.slug);
      }
    }
  }

  return map;
};

export const importData: TaskFunction = async (config) => {
  const logger = config.logger;
  await validateImportExportFolders(config);

  // 1. Scan files and build lookup map
  const fileMap = await getContentTitleInfoMap([
    {
      folder: path.join(config.PATHS.OBSIDIAN_DATA, "Moves"),
      contentType: ContentType.MOVE,
    },
    {
      folder: path.join(config.PATHS.OBSIDIAN_DATA, "Concepts"),
      contentType: ContentType.CONCEPT,
    },
  ]);

  // Track written slugs to clean up orphans later
  const writtenMoves = new Set<string>();
  const writtenConcepts = new Set<string>();

  // 2. Process files
  for (const [title, info] of fileMap.entries()) {
    logger.info(`Processing: ${title} (${info.type})`);
    const content = fs.readFileSync(info.path, "utf-8");
    const parsed = matter(content);
    const data = parsed.data as ObsidianFrontmatter;
    let body = parsed.content;

    // Transform Frontmatter
    const newFrontmatter: any = {
      title: title,
      variations: info.variations,
      ...data,
    };

    // Ensure video_urls is an array of strings
    if (newFrontmatter.video_urls) {
      if (!Array.isArray(newFrontmatter.video_urls)) {
        if (typeof newFrontmatter.video_urls === "string") {
          newFrontmatter.video_urls = [newFrontmatter.video_urls];
        } else {
          logger.error(
            `Invalid video_urls format for ${title}. Expected string or array of strings.`,
          );
          // Fallback or error? Let's just remove if invalid
          delete newFrontmatter.video_urls;
        }
      }
    }

    // Fix dates
    if (data.created_date) {
      const parsed = parseObsidianDate(data.created_date);
      if (parsed) newFrontmatter.created_date = parsed;
      else
        logger.warn(
          `Failed to parse created_date for ${title}: ${data.created_date}`,
        );
    }
    if (data.updated_date) {
      const parsed = parseObsidianDate(data.updated_date);
      if (parsed) newFrontmatter.updated_date = parsed;
      else
        logger.warn(
          `Failed to parse updated_date for ${title}: ${data.updated_date}`,
        );
    }

    // Resolve Relations (convert titles to slugs)
    const resolveRelations = (items: any[] | undefined) => {
      if (!items) return undefined;
      const normalizedItems = normalizeRelationItems(items);
      const slugs = new Set<string>();
      for (const cleanItemStr of normalizedItems) {
        // Clean up [[Link]] syntax if present in frontmatter
        const cleanItem = cleanItemStr.replace(/^\[\[(.*)\]\]$/, "$1");
        const target = fileMap.get(cleanItem);
        if (target) {
          slugs.add(target.slug);
        } else {
          logger.warn(`Relation not found: ${cleanItem} in ${title}`);
        }
      }
      return Array.from(slugs);
    };

    if (newFrontmatter.related_moves)
      newFrontmatter.related_moves = resolveRelations(
        newFrontmatter.related_moves,
      );
    if (newFrontmatter.related_concepts)
      newFrontmatter.related_concepts = resolveRelations(
        newFrontmatter.related_concepts,
      );
    if (newFrontmatter.setup_moves)
      newFrontmatter.setup_moves = resolveRelations(newFrontmatter.setup_moves);
    if (newFrontmatter.exit_moves)
      newFrontmatter.exit_moves = resolveRelations(newFrontmatter.exit_moves);

    // Transform Content
    const referencedMoves = new Set<string>();
    const referencedConcepts = new Set<string>();

    body = body.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      // Handle [[Link|Alias]]
      const [linkTarget, linkAlias] = linkText.split("|");
      const targetTitle = linkTarget.trim();
      const alias = linkAlias ? linkAlias.trim() : targetTitle;

      const targetInfo = fileMap.get(targetTitle);
      if (targetInfo) {
        if (targetInfo.type === "move") {
          referencedMoves.add(targetInfo.slug);
          return `[${alias}](/moves/${targetInfo.slug})`;
        } else {
          referencedConcepts.add(targetInfo.slug);
          return `[${alias}](/concepts/${targetInfo.slug})`;
        }
      } else {
        console.warn(`Broken link: [[${linkText}]] in ${title}`);
        return match;
      }
    });

    // Add referenced items to frontmatter
    if (referencedMoves.size > 0) {
      const existing = new Set(newFrontmatter.related_moves || []);
      for (const move of referencedMoves) {
        if (move !== info.slug) existing.add(move);
      }
      newFrontmatter.related_moves = Array.from(existing);
    }

    if (referencedConcepts.size > 0) {
      const existing = new Set(newFrontmatter.related_concepts || []);
      for (const concept of referencedConcepts) {
        if (concept !== info.slug) existing.add(concept);
      }
      newFrontmatter.related_concepts = Array.from(existing);
    }

    // Convert tabs to spaces
    body = body.replace(/\t/g, "  ");

    // Ensure numeric fields are numbers
    if (newFrontmatter.difficulty)
      newFrontmatter.difficulty = Number(newFrontmatter.difficulty);
    if (newFrontmatter.leader_difficulty)
      newFrontmatter.leader_difficulty = Number(
        newFrontmatter.leader_difficulty,
      );
    if (newFrontmatter.follower_difficulty)
      newFrontmatter.follower_difficulty = Number(
        newFrontmatter.follower_difficulty,
      );

    const finalFrontmatter = cleanFrontmatter(newFrontmatter);

    // Write file
    const outDir =
      info.type === ContentType.MOVE
        ? config.PATHS.CONTENT_MOVES
        : config.PATHS.CONTENT_CONCEPTS;
    const outPath = path.join(outDir, `${info.slug}.md`);

    const newContent = matter.stringify(body, finalFrontmatter);
    fs.writeFileSync(outPath, newContent);

    // Track written slug
    if (info.type === ContentType.MOVE) {
      writtenMoves.add(`${info.slug}.md`);
    } else {
      writtenConcepts.add(`${info.slug}.md`);
    }
  }

  // 3. Clean up orphan files (handles deletions/renames in data repo)
  function cleanOrphans(dir: string, writtenSet: Set<string>, label: string) {
    if (!fs.existsSync(dir)) return;
    const existingFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of existingFiles) {
      if (!writtenSet.has(file)) {
        const orphanPath = path.join(dir, file);
        fs.unlinkSync(orphanPath);
        logger.deleted(`Orphan ${label}: ${file}`);
      }
    }
  }

  cleanOrphans(config.PATHS.CONTENT_MOVES, writtenMoves, "move");
  cleanOrphans(config.PATHS.CONTENT_CONCEPTS, writtenConcepts, "concept");

  logger.success(`Import complete. Processed ${fileMap.size} files.`);
};

// Run main only if executed directly
import { fileURLToPath } from "node:url";
import type { BuildConfig, TaskFunction } from "@scripts/types.js";
import { getConfigFromCli } from "@scripts/utils/cli-config.js";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { config } = getConfigFromCli();
  importData(config);
}
