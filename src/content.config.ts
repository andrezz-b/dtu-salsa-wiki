import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const commonFields = {
  title: z.string(),
  description: z.string(),
  meta_title: z.string().optional(),
  date: z.date().optional(),
  image: z.string().optional(),
  draft: z.boolean(),
};

// Moves collection schema
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
    video_url: z.string().url().optional(),
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

// Concepts collection schema
const conceptsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/concepts" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(["hold", "position", "technique", "musicality", "finish"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    video_url: z.string().url().optional(),
    related_concepts: z.array(reference("concepts")).optional(),
    related_moves: z.array(reference("moves")).optional(),
    created_date: z.date().optional(),
    updated_date: z.date().optional(),
    draft: z.boolean().optional(),
  }),
});

// Post collection schema (Legacy - Disabled)
// const blogCollection = defineCollection({
//   loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/blog" }),
//   schema: z.object({
//     title: z.string(),
//     meta_title: z.string().optional(),
//     description: z.string().optional(),
//     date: z.date().optional(),
//     image: z.string().optional(),
//     author: z.string().default("Admin"),
//     categories: z.array(z.string()).default(["others"]),
//     tags: z.array(z.string()).default(["others"]),
//     draft: z.boolean().optional(),
//   }),
// });

// Author collection schema (Legacy - Disabled)
// const authorsCollection = defineCollection({
//   loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/authors" }),
//   schema: z.object({
//     ...commonFields,
//     social: z
//       .array(
//         z
//           .object({
//             name: z.string().optional(),
//             icon: z.string().optional(),
//             link: z.string().optional(),
//           })
//           .optional(),
//       )
//       .optional(),
//     draft: z.boolean().optional(),
//   }),
// });

// Pages collection schema
const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.object({
    ...commonFields,
  }),
});

// about collection schema
const aboutCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/about" }),
  schema: z.object({
    ...commonFields,
  }),
});

// contact collection schema
const contactCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/contact" }),
  schema: z.object({
    ...commonFields,
  }),
});

// Homepage collection schema
const homepageCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/homepage" }),
  schema: z.object({
    banner: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string(),
      button: z.object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      }),
    }),
    features: z.array(
      z.object({
        title: z.string(),
        image: z.string(),
        content: z.string(),
        bulletpoints: z.array(z.string()),
        button: z.object({
          enable: z.boolean(),
          label: z.string(),
          link: z.string(),
        }),
      }),
    ),
  }),
});

// Call to Action collection schema
const ctaSectionCollection = defineCollection({
  loader: glob({
    pattern: "call-to-action.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    button: z.object({
      enable: z.boolean(),
      label: z.string(),
      link: z.string(),
    }),
  }),
});

// Testimonials Section collection schema
const testimonialSectionCollection = defineCollection({
  loader: glob({
    pattern: "testimonial.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    description: z.string(),
    testimonials: z.array(
      z.object({
        name: z.string(),
        avatar: z.string(),
        designation: z.string(),
        content: z.string(),
      }),
    ),
  }),
});

// Export collections
export const collections = {
  // Pages
  homepage: homepageCollection,
  // blog: blogCollection,
  // authors: authorsCollection,
  moves: movesCollection,
  concepts: conceptsCollection,
  pages: pagesCollection,
  about: aboutCollection,
  contact: contactCollection,

  // sections
  ctaSection: ctaSectionCollection,
  testimonialSection: testimonialSectionCollection,
};
