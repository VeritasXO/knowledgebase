import {
  insertArticleSchema,
  selectArticleSchema,
} from "@shared/schemas/db/articles";
import { z } from "zod";

// Article validation schemas
export const articleFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be at most 255 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  summary: z
    .string()
    .max(500, "Summary must be at most 500 characters")
    .optional(),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  tags: z
    .array(
      z.object({
        id: z.string().uuid().optional(), // Optional for new tags
        name: z
          .string()
          .min(1, "Tag name is required")
          .max(50, "Tag name too long"),
      }),
    )
    .default([]),
});

export const articleSearchSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
  authorId: z.string().optional(),
  departmentSlug: z.string().optional(),
  categoryId: z.string().optional(),
});

// Export types
export type ArticleForm = z.infer<typeof articleFormSchema>;
export type ArticleInsert = z.infer<typeof insertArticleSchema>;
export type ArticleSelect = z.infer<typeof selectArticleSchema>;
export type ArticleSearch = z.infer<typeof articleSearchSchema>;
export type ArticleTag = {
  id?: string;
  name: string;
};
