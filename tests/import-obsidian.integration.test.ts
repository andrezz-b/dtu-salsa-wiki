import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";
import { importData, slugger } from "../scripts/build/import-obsidian.js";
import type { BuildConfig } from "../scripts/types.js";

// Helper to create a mock markdown file with frontmatter
function createMockFile(
  dir: string,
  filename: string,
  frontmatter: object,
  content: string,
): void {
  const filePath = path.join(dir, filename);
  const fileContent = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, fileContent);
}

// Helper to read and parse output file
function readOutputFile(filePath: string): {
  frontmatter: any;
  content: string;
} {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  return { frontmatter: parsed.data, content: parsed.content };
}

describe("Import Obsidian Integration", () => {
  let tempDir: string;
  let obsidianPath: string;
  let movesSourcePath: string;
  let conceptsSourcePath: string;
  let movesOutPath: string;
  let conceptsOutPath: string;
  let testConfig: BuildConfig;

  before(() => {
    // Create temp directory structure
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "import-obsidian-test-"));
    obsidianPath = path.join(tempDir, "obsidian-data");
    movesSourcePath = path.join(obsidianPath, "Moves");
    conceptsSourcePath = path.join(obsidianPath, "Concepts");
    movesOutPath = path.join(tempDir, "output", "moves");
    conceptsOutPath = path.join(tempDir, "output", "concepts");

    // Create directory structure
    fs.mkdirSync(movesSourcePath, { recursive: true });
    fs.mkdirSync(conceptsSourcePath, { recursive: true });
    fs.mkdirSync(movesOutPath, { recursive: true });
    fs.mkdirSync(conceptsOutPath, { recursive: true });

    // Create test config
    testConfig = {
      PATHS: {
        OBSIDIAN_DATA: obsidianPath,
        CACHE_FILE: path.join(tempDir, ".import-cache"),
        JSON_FOLDER: path.join(tempDir, "json"),
        CONTENT_MOVES: movesOutPath,
        CONTENT_CONCEPTS: conceptsOutPath,
      },
      GIT: {
        REPO_SSH: "",
        REPO_HTTPS_TEMPLATE: "",
        TOKEN_ENV_VAR: "",
      },
      CONTENT_FOLDERS: ["Moves", "Concepts"],
      logger: {
        info: () => {},
        warn: () => {},
        error: () => {},
        success: () => {},
        skip: () => {},
        deleted: () => {},
      },
    };
  });

  after(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Reset slugger to avoid slug collisions between tests
    slugger.reset();

    // Clean source and output directories between tests
    for (const file of fs.readdirSync(movesSourcePath)) {
      fs.unlinkSync(path.join(movesSourcePath, file));
    }
    for (const file of fs.readdirSync(conceptsSourcePath)) {
      fs.unlinkSync(path.join(conceptsSourcePath, file));
    }
    for (const file of fs.readdirSync(movesOutPath)) {
      fs.unlinkSync(path.join(movesOutPath, file));
    }
    for (const file of fs.readdirSync(conceptsOutPath)) {
      fs.unlinkSync(path.join(conceptsOutPath, file));
    }
  });

  it("should import files with correct slugified names", async () => {
    // Create source files
    createMockFile(
      movesSourcePath,
      "Cross Body Lead.md",
      { tags: ["basic"] },
      "A fundamental salsa move.",
    );
    createMockFile(
      conceptsSourcePath,
      "Frame Connection.md",
      { tags: ["technique"] },
      "Maintaining proper frame.",
    );

    // Run import
    await importData(testConfig);

    // Verify output files exist with slugified names
    assert.ok(
      fs.existsSync(path.join(movesOutPath, "cross-body-lead.md")),
      "Move file should be slugified",
    );
    assert.ok(
      fs.existsSync(path.join(conceptsOutPath, "frame-connection.md")),
      "Concept file should be slugified",
    );

    // Verify frontmatter includes title
    const moveOutput = readOutputFile(
      path.join(movesOutPath, "cross-body-lead.md"),
    );
    assert.strictEqual(moveOutput.frontmatter.title, "Cross Body Lead");
    assert.deepStrictEqual(moveOutput.frontmatter.tags, ["basic"]);
  });

  it("should transform [[wiki links]] to markdown links", async () => {
    // Create files with wiki links
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {},
      "Start with [[Cross Body Lead]].",
    );
    createMockFile(movesSourcePath, "Cross Body Lead.md", {}, "Basic move.");
    createMockFile(conceptsSourcePath, "Timing.md", {}, "Learn the timing.");

    await importData(testConfig);

    const enchuflaOutput = readOutputFile(
      path.join(movesOutPath, "enchufla.md"),
    );
    assert.ok(
      enchuflaOutput.content.includes(
        "[Cross Body Lead](/moves/cross-body-lead)",
      ),
      "Wiki link should be converted to markdown link",
    );
  });

  it("should handle wiki links with aliases [[Link|Alias]]", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {},
      "Do the [[Cross Body Lead|CBL]] first.",
    );
    createMockFile(movesSourcePath, "Cross Body Lead.md", {}, "Basic move.");

    await importData(testConfig);

    const enchuflaOutput = readOutputFile(
      path.join(movesOutPath, "enchufla.md"),
    );
    assert.ok(
      enchuflaOutput.content.includes("[CBL](/moves/cross-body-lead)"),
      "Alias should be used in link text",
    );
  });

  it("should populate related_moves from body links", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {},
      "Start with [[Cross Body Lead]] and end with [[Dile Que No]].",
    );
    createMockFile(movesSourcePath, "Cross Body Lead.md", {}, "Basic.");
    createMockFile(movesSourcePath, "Dile Que No.md", {}, "Exit move.");

    await importData(testConfig);

    const enchuflaOutput = readOutputFile(
      path.join(movesOutPath, "enchufla.md"),
    );
    assert.ok(Array.isArray(enchuflaOutput.frontmatter.related_moves));
    assert.ok(
      enchuflaOutput.frontmatter.related_moves.includes("cross-body-lead"),
    );
    assert.ok(enchuflaOutput.frontmatter.related_moves.includes("dile-que-no"));
  });

  it("should resolve frontmatter relations (titles to slugs)", async () => {
    createMockFile(
      movesSourcePath,
      "Sombrero.md",
      {
        setup_moves: ["Cross Body Lead"],
        exit_moves: ["Dile Que No"],
      },
      "A hat move.",
    );
    createMockFile(movesSourcePath, "Cross Body Lead.md", {}, "Setup move.");
    createMockFile(movesSourcePath, "Dile Que No.md", {}, "Exit move.");

    await importData(testConfig);

    const sombreroOutput = readOutputFile(
      path.join(movesOutPath, "sombrero.md"),
    );
    assert.deepStrictEqual(sombreroOutput.frontmatter.setup_moves, [
      "cross-body-lead",
    ]);
    assert.deepStrictEqual(sombreroOutput.frontmatter.exit_moves, [
      "dile-que-no",
    ]);
  });

  it("should delete orphan files in output directory", async () => {
    // Create an orphan file in output
    fs.writeFileSync(
      path.join(movesOutPath, "orphan-move.md"),
      "orphan content",
    );

    // Create only one source file
    createMockFile(movesSourcePath, "Enchufla.md", {}, "Content.");

    await importData(testConfig);

    // Orphan should be deleted
    assert.ok(
      !fs.existsSync(path.join(movesOutPath, "orphan-move.md")),
      "Orphan file should be deleted",
    );
    // New file should exist
    assert.ok(
      fs.existsSync(path.join(movesOutPath, "enchufla.md")),
      "Imported file should exist",
    );
  });

  it("should parse Obsidian date format correctly", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {
        created_date: "2025-01-15, 10:30",
        updated_date: "2025-06-20, 14:45",
      },
      "Content.",
    );

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    // gray-matter parses dates back as Date objects or strings depending on format
    const createdDate = new Date(output.frontmatter.created_date);
    assert.strictEqual(createdDate.getFullYear(), 2025);
    assert.strictEqual(createdDate.getMonth(), 0); // January = 0
    assert.strictEqual(createdDate.getDate(), 15);
    assert.strictEqual(createdDate.getHours(), 10);
    assert.strictEqual(createdDate.getMinutes(), 30);
  });

  it("should normalize video_urls from string to array", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      { video_urls: "https://youtube.com/watch?v=123" },
      "Content.",
    );

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.ok(Array.isArray(output.frontmatter.video_urls));
    assert.deepStrictEqual(output.frontmatter.video_urls, [
      "https://youtube.com/watch?v=123",
    ]);
  });

  it("should pass through video_urls array unchanged", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      { video_urls: ["https://youtube.com/1", "https://youtube.com/2"] },
      "Content.",
    );

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.deepStrictEqual(output.frontmatter.video_urls, [
      "https://youtube.com/1",
      "https://youtube.com/2",
    ]);
  });

  it("should convert numeric fields to numbers", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {
        difficulty: "3",
        leader_difficulty: "4",
        follower_difficulty: "2",
      },
      "Content.",
    );

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.strictEqual(output.frontmatter.difficulty, 3);
    assert.strictEqual(output.frontmatter.leader_difficulty, 4);
    assert.strictEqual(output.frontmatter.follower_difficulty, 2);
  });

  it("should link to concepts correctly from moves", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {},
      "Requires good [[Frame Connection]].",
    );
    createMockFile(
      conceptsSourcePath,
      "Frame Connection.md",
      {},
      "Technique concept.",
    );

    await importData(testConfig);

    const enchuflaOutput = readOutputFile(
      path.join(movesOutPath, "enchufla.md"),
    );
    assert.ok(
      enchuflaOutput.content.includes(
        "[Frame Connection](/concepts/frame-connection)",
      ),
      "Link to concept should use /concepts/ path",
    );
    assert.ok(
      enchuflaOutput.frontmatter.related_concepts?.includes("frame-connection"),
      "Concept should be added to related_concepts",
    );
  });

  it("should not include self-references in related fields", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {},
      "The [[Enchufla]] is recursive.",
    );

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    // Self-reference should be transformed but not added to related_moves
    assert.ok(
      !output.frontmatter.related_moves?.includes("enchufla"),
      "Self-reference should not be in related_moves",
    );
  });

  it("should merge existing related_moves with referenced moves", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      { related_moves: ["Cross Body Lead"] },
      "Also links to [[Dile Que No]].",
    );
    createMockFile(movesSourcePath, "Cross Body Lead.md", {}, "Setup.");
    createMockFile(movesSourcePath, "Dile Que No.md", {}, "Exit.");

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.ok(output.frontmatter.related_moves.includes("cross-body-lead"));
    assert.ok(output.frontmatter.related_moves.includes("dile-que-no"));
  });

  it("should convert tabs to spaces in content", async () => {
    createMockFile(movesSourcePath, "Enchufla.md", {}, "Line with\ttab.");

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.ok(
      !output.content.includes("\t"),
      "Tabs should be converted to spaces",
    );
    assert.ok(
      output.content.includes("Line with  tab."),
      "Content should have spaces",
    );
  });

  it("should clean empty frontmatter fields", async () => {
    createMockFile(
      movesSourcePath,
      "Enchufla.md",
      {
        tags: [],
        aliases: null,
        related_moves: [],
      },
      "Content.",
    );

    await importData(testConfig);

    const output = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.strictEqual(output.frontmatter.tags, undefined);
    assert.strictEqual(output.frontmatter.aliases, undefined);
    assert.strictEqual(output.frontmatter.related_moves, undefined);
  });
  it("should add variations if moves are in the same folder", async () => {
    const variationFolder = path.join(movesSourcePath, "Coca-Cola");
    await fsp.mkdir(variationFolder, { recursive: true });
    createMockFile(variationFolder, "Coca-Cola.md", {}, "Awesome move.");
    createMockFile(variationFolder, "Coca-Cola Two Hands.md", {}, "Base move.");
    createMockFile(variationFolder, "Enchufla.md", {}, "Base move content.");

    await importData(testConfig);

    const cocaCola = readOutputFile(path.join(movesOutPath, "coca-cola.md"));
    assert.ok(cocaCola.frontmatter.variations.includes("coca-cola-two-hands"));
    assert.ok(cocaCola.frontmatter.variations.includes("enchufla"));
    const enchufla = readOutputFile(path.join(movesOutPath, "enchufla.md"));
    assert.ok(enchufla.frontmatter.variations.includes("coca-cola"));
    assert.ok(enchufla.frontmatter.variations.includes("coca-cola-two-hands"));

    const cocaColaTwoHands = readOutputFile(
      path.join(movesOutPath, "coca-cola-two-hands.md"),
    );
    assert.ok(cocaColaTwoHands.frontmatter.variations.includes("coca-cola"));
    assert.ok(cocaColaTwoHands.frontmatter.variations.includes("enchufla"));
  });
});
