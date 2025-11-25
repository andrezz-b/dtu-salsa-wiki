import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import Slugger from 'github-slugger';

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
  [key: string]: any;
}

export interface FileInfo {
  originalTitle: string;
  slug: string;
  type: 'move' | 'concept';
  path: string;
}

// Helpers
export const slugger = new Slugger();
export const generateSlug = (title: string) => slugger.slug(title);

export const parseObsidianDate = (val: any): Date | undefined => {
  if (val instanceof Date) return val;
  if (typeof val !== 'string') return undefined;
  
  try {
    const [datePart, timePart] = val.split(', ');
    if (!datePart || !timePart) return undefined;
    const [hours, minutes] = timePart.split(':');
    const paddedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
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
    const cleaned = obj.map(cleanFrontmatter).filter(item => item !== null && item !== undefined && item !== '');
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof obj === 'object' && obj !== null) {
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
        
        if (typeof itemStr === 'string') {
            result.push(itemStr);
        }
    }
    return result;
}

async function main() {
    // Configuration
    const args = process.argv.slice(2);
    const usage = "Usage: npx tsx scripts/import-obsidian.ts --moves-out <path> --concepts-out <path>";

    function getArg(name: string): string | undefined {
      const index = args.indexOf(name);
      if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
      }
      return undefined;
    }

    const movesOutArg = getArg('--moves-out');
    const conceptsOutArg = getArg('--concepts-out');

    if (!movesOutArg || !conceptsOutArg) {
      console.error("Error: Missing output paths.");
      console.error(usage);
      process.exit(1);
    }

    const OBSIDIAN_PATH = path.join(process.cwd(), 'obsidian-data');
    const MOVES_OUT_PATH = path.resolve(process.cwd(), movesOutArg);
    const CONCEPTS_OUT_PATH = path.resolve(process.cwd(), conceptsOutArg);

    console.log(`Importing from: ${OBSIDIAN_PATH}`);
    console.log(`Moves output: ${MOVES_OUT_PATH}`);
    console.log(`Concepts output: ${CONCEPTS_OUT_PATH}`);

    // Ensure output directories exist
    if (!fs.existsSync(MOVES_OUT_PATH)) fs.mkdirSync(MOVES_OUT_PATH, { recursive: true });
    if (!fs.existsSync(CONCEPTS_OUT_PATH)) fs.mkdirSync(CONCEPTS_OUT_PATH, { recursive: true });

    // 1. Scan files and build lookup map
    const fileMap = new Map<string, FileInfo>();

    function scanDirectory(dir: string, type: 'move' | 'concept') {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(dir, file);
          const originalTitle = path.basename(file, '.md');
          const slug = generateSlug(originalTitle);
          fileMap.set(originalTitle, { originalTitle, slug, type, path: filePath });
        }
      }
    }

    console.log('Scanning Obsidian files...');
    scanDirectory(path.join(OBSIDIAN_PATH, 'Moves'), 'move');
    scanDirectory(path.join(OBSIDIAN_PATH, 'Concepts'), 'concept');
    console.log(`Found ${fileMap.size} files.`);

    // 2. Process files
    for (const [title, info] of fileMap.entries()) {
      console.log(`Processing: ${title} (${info.type})`);
      const content = fs.readFileSync(info.path, 'utf-8');
      const parsed = matter(content);
      const data = parsed.data as ObsidianFrontmatter;
      let body = parsed.content;

      // Transform Frontmatter
      const newFrontmatter: any = {
        title: title,
        ...data,
      };

      // Fix dates
      if (data.created_date) {
        const parsed = parseObsidianDate(data.created_date);
        if (parsed) newFrontmatter.created_date = parsed;
        else console.warn(`Failed to parse created_date for ${title}: ${data.created_date}`);
      }
      if (data.updated_date) {
        const parsed = parseObsidianDate(data.updated_date);
        if (parsed) newFrontmatter.updated_date = parsed;
        else console.warn(`Failed to parse updated_date for ${title}: ${data.updated_date}`);
      }

      // Resolve Relations (convert titles to slugs)
      const resolveRelations = (items: any[] | undefined) => {
        if (!items) return undefined;
        const normalizedItems = normalizeRelationItems(items);
        const slugs = new Set<string>();
        for (const cleanItemStr of normalizedItems) {
            // Clean up [[Link]] syntax if present in frontmatter
            const cleanItem = cleanItemStr.replace(/^\[\[(.*)\]\]$/, '$1');
            const target = fileMap.get(cleanItem);
            if (target) {
                slugs.add(target.slug);
            } else {
                console.warn(`Relation not found: ${cleanItem} in ${title}`);
            }
        }
        return Array.from(slugs);
      };

      if (newFrontmatter.related_moves) newFrontmatter.related_moves = resolveRelations(newFrontmatter.related_moves);
      if (newFrontmatter.related_concepts) newFrontmatter.related_concepts = resolveRelations(newFrontmatter.related_concepts);
      if (newFrontmatter.setup_moves) newFrontmatter.setup_moves = resolveRelations(newFrontmatter.setup_moves);
      if (newFrontmatter.exit_moves) newFrontmatter.exit_moves = resolveRelations(newFrontmatter.exit_moves);

      // Transform Content
      const referencedMoves = new Set<string>();
      const referencedConcepts = new Set<string>();

      body = body.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
        // Handle [[Link|Alias]]
        const [linkTarget, linkAlias] = linkText.split('|');
        const targetTitle = linkTarget.trim();
        const alias = linkAlias ? linkAlias.trim() : targetTitle;

        const targetInfo = fileMap.get(targetTitle);
        if (targetInfo) {
          if (targetInfo.type === 'move') {
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
      body = body.replace(/\t/g, '  ');

      // Ensure numeric fields are numbers
      if (newFrontmatter.difficulty) newFrontmatter.difficulty = Number(newFrontmatter.difficulty);
      if (newFrontmatter.leader_difficulty) newFrontmatter.leader_difficulty = Number(newFrontmatter.leader_difficulty);
      if (newFrontmatter.follower_difficulty) newFrontmatter.follower_difficulty = Number(newFrontmatter.follower_difficulty);

      const finalFrontmatter = cleanFrontmatter(newFrontmatter);

      // Write file
      const outDir = info.type === 'move' ? MOVES_OUT_PATH : CONCEPTS_OUT_PATH;
      const outPath = path.join(outDir, `${info.slug}.md`);
      
      const newContent = matter.stringify(body, finalFrontmatter);
      fs.writeFileSync(outPath, newContent);
      console.log(`Wrote: ${outPath}`);
    }

    console.log('Import complete.');
}

// Run main only if executed directly
import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
