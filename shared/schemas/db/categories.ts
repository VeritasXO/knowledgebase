import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { departmentsSchema } from "./departments";

export const categoriesSchema = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    departmentId: uuid("department_id")
      .references(() => departmentsSchema.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Ensure slug is unique within a department
    departmentSlugIdx: uniqueIndex("department_slug_idx").on(
      table.departmentId,
      table.slug,
    ),
  }),
);

// Zod schemas
export const insertCategorySchema = createInsertSchema(categoriesSchema);
export const selectCategorySchema = createSelectSchema(categoriesSchema);
export const updateCategorySchema = insertCategorySchema.partial().required({
  id: true,
});

// Types
export type CategorySelect = z.infer<typeof selectCategorySchema>;
export type CategoryInsert = z.infer<typeof insertCategorySchema>;
export type CategoryUpdate = z.infer<typeof updateCategorySchema>;
