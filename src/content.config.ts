import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const movesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/moves" }),
  schema: z.object({
    title: z.string(),
    aliases: z.array(z.string()).optional(),
    type: z.enum(["partner", "rueda", "shine", "solo", "dip", "trick"]),
    difficulty: z.number().min(1).max(5).step(0.5),
    leader_difficulty: z.number().min(1).max(5).step(0.5).optional(),
    follower_difficulty: z.number().min(1).max(5).step(0.5).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    video_urls: z.array(z.string().url()).optional(),
    related_concepts: z.array(reference("concepts")).optional(), // References handled by slug in frontmatter usually, or use reference() if available but simple string array is safer for now with basic loader
    setup_moves: z.array(reference("moves")).optional(),
    exit_moves: z.array(reference("moves")).optional(),
    related_moves: z.array(reference("moves")).optional(),
    tags: z.array(z.string()).default([]),
    created_date: z.date().optional(),
    updated_date: z.date().optional(),
    draft: z.boolean().optional(),
  }),
});

const conceptsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/concepts" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(["hold", "position", "technique", "musicality", "finish"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    video_urls: z.array(z.string().url()).optional(),
    related_concepts: z.array(reference("concepts")).optional(),
    related_moves: z.array(reference("moves")).optional(),
    created_date: z.date().optional(),
    updated_date: z.date().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  moves: movesCollection,
  concepts: conceptsCollection,
};
