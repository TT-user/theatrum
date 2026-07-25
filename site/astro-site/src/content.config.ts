import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    author: z.string(),
    keywords: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

export const collections = { blog };
