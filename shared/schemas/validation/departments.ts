import { z } from "zod";
import {
  updateCategorySchema as dbUpdateCategorySchema,
  insertCategorySchema,
  selectCategorySchema,
} from "../db/categories";
import {
  updateDepartmentSchema as dbUpdateDepartmentSchema,
  insertDepartmentSchema,
  selectDepartmentSchema,
} from "../db/departments";

// Department form schema
export const departmentFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  image: z.string().optional(),
});

// Full department schema including ID, timestamps, etc.
export const departmentSchema = selectDepartmentSchema.extend({
  articleCount: z.number().optional(),
});
export const createDepartmentSchema = insertDepartmentSchema;
export const updateDepartmentSchema = dbUpdateDepartmentSchema;

// Category form schema
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  departmentId: z.string().uuid("Department ID must be a valid UUID"),
});

// Full category schema including ID, timestamps, etc.
export const categorySchema = selectCategorySchema.extend({
  articleCount: z.number().optional(),
});
export const createCategorySchema = insertCategorySchema;
export const updateCategorySchema = dbUpdateCategorySchema;

// Department with categories - for displaying department details with its categories
export const departmentWithCategoriesSchema = departmentSchema.extend({
  categories: z.array(categorySchema).optional(),
});

export type DepartmentForm = z.infer<typeof departmentFormSchema>;
export type CategoryForm = z.infer<typeof categoryFormSchema>;
export type Department = z.infer<typeof departmentSchema>;
export type Category = z.infer<typeof categorySchema>;
export type DepartmentWithCategories = z.infer<
  typeof departmentWithCategoriesSchema
>;
