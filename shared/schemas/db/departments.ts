import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const departmentsSchema = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const insertDepartmentSchema = createInsertSchema(departmentsSchema);
export const selectDepartmentSchema = createSelectSchema(departmentsSchema);
export const updateDepartmentSchema = insertDepartmentSchema
  .partial()
  .required({
    id: true,
  });

// Types
export type DepartmentSelect = z.infer<typeof selectDepartmentSchema>;
export type DepartmentInsert = z.infer<typeof insertDepartmentSchema>;
export type DepartmentUpdate = z.infer<typeof updateDepartmentSchema>;
