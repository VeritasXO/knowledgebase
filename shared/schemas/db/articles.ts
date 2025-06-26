import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { categoriesSchema } from "./categories";
import { usersSchema } from "./users";

export const articlesSchema = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary"),
  authorId: uuid("author_id")
    .references(() => usersSchema.id)
    .notNull(),
  categoryId: uuid("category_id").references(() => categoriesSchema.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
});

// Zod schemas
export const insertArticleSchema = createInsertSchema(articlesSchema);
export const selectArticleSchema = createSelectSchema(articlesSchema);
export const updateArticleSchema = insertArticleSchema.partial().required({
  id: true,
});

// Types
export type ArticleSelect = z.infer<typeof selectArticleSchema>;
export type ArticleInsert = z.infer<typeof insertArticleSchema>;
export type ArticleUpdate = z.infer<typeof updateArticleSchema>;
