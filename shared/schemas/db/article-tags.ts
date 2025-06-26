import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { articlesSchema } from "./articles";

// Define the article_tags table schema
export const articleTagsSchema = pgTable("article_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .references(() => articlesSchema.id)
    .notNull(),
  name: text("name").notNull(),
  // Using a composite unique constraint to prevent duplicate tags on the same article
});

// Create Zod schemas for validation
export const insertArticleTagSchema = createInsertSchema(articleTagsSchema);
export const selectArticleTagSchema = createSelectSchema(articleTagsSchema);
export const updateArticleTagSchema = insertArticleTagSchema
  .partial()
  .required({
    id: true,
  });

// Types
export type ArticleTagSelect = z.infer<typeof selectArticleTagSchema>;
export type ArticleTagInsert = z.infer<typeof insertArticleTagSchema>;
export type ArticleTagUpdate = z.infer<typeof updateArticleTagSchema>;
