import { db } from "@server/db";
import { articlesSchema, categoriesSchema } from "@shared/schemas/db";
import { CategoryForm } from "@shared/schemas/validation/departments";
import { and, count, desc, eq } from "drizzle-orm";

/**
 * Create a new category
 */
export async function createCategory(data: CategoryForm) {
  const [newCategory] = await db
    .insert(categoriesSchema)
    .values(data)
    .returning();

  return newCategory;
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, data: Partial<CategoryForm>) {
  const [updatedCategory] = await db
    .update(categoriesSchema)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categoriesSchema.id, id))
    .returning();

  return updatedCategory;
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: string) {
  const category = await db
    .select()
    .from(categoriesSchema)
    .where(eq(categoriesSchema.id, id))
    .limit(1);

  return category[0] || null;
}

/**
 * Get a category by slug within a specific department
 */
export async function getCategoryBySlug(departmentId: string, slug: string) {
  const category = await db
    .select()
    .from(categoriesSchema)
    .where(
      and(
        eq(categoriesSchema.departmentId, departmentId),
        eq(categoriesSchema.slug, slug),
      ),
    )
    .limit(1);

  return category[0] || null;
}

/**
 * List all categories for a department
 */
export async function listCategoriesForDepartment(departmentId: string) {
  return db
    .select()
    .from(categoriesSchema)
    .where(eq(categoriesSchema.departmentId, departmentId))
    .orderBy(categoriesSchema.name);
}

/**
 * Get article count for a category
 */
export async function getCategoryArticleCount(categoryId: string) {
  const result = await db
    .select({ count: count() })
    .from(articlesSchema)
    .where(eq(articlesSchema.categoryId, categoryId));

  return result[0]?.count || 0;
}

/**
 * List articles for a category
 */
export async function listArticlesForCategory(
  categoryId: string,
  limit: number = 10,
  offset: number = 0,
) {
  return db
    .select()
    .from(articlesSchema)
    .where(eq(articlesSchema.categoryId, categoryId))
    .orderBy(desc(articlesSchema.updatedAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Delete a category (will cascade to articles)
 */
export async function deleteCategory(id: string) {
  await db.delete(categoriesSchema).where(eq(categoriesSchema.id, id));

  return { success: true };
}
