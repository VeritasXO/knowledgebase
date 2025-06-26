import { db } from "@server/db";
import {
  articlesSchema,
  categoriesSchema,
  departmentsSchema,
} from "@shared/schemas/db";
import {
  DepartmentForm,
  DepartmentWithCategories,
} from "@shared/schemas/validation/departments";
import { count, eq, inArray, sql } from "drizzle-orm";

// DEPARTMENTS

/**
 * Create a new department
 */
export async function createDepartment(data: DepartmentForm) {
  const [newDepartment] = await db
    .insert(departmentsSchema)
    .values(data)
    .returning();

  return newDepartment;
}

/**
 * Update an existing department
 */
export async function updateDepartment(
  id: string,
  data: Partial<DepartmentForm>,
) {
  const [updatedDepartment] = await db
    .update(departmentsSchema)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(departmentsSchema.id, id))
    .returning();

  return updatedDepartment;
}

/**
 * Get a department by ID
 */
export async function getDepartmentById(id: string) {
  const department = await db
    .select()
    .from(departmentsSchema)
    .where(eq(departmentsSchema.id, id))
    .limit(1);

  return department[0] || null;
}

/**
 * Get a department by slug
 */
export async function getDepartmentBySlug(slug: string) {
  const department = await db
    .select()
    .from(departmentsSchema)
    .where(eq(departmentsSchema.slug, slug))
    .limit(1);

  return department[0] || null;
}

/**
 * Get department with its categories
 */
export async function getDepartmentWithCategories(
  id: string,
): Promise<DepartmentWithCategories | null> {
  const department = await getDepartmentById(id);
  if (!department) {
    return null;
  }

  const departmentCategories = await db
    .select()
    .from(categoriesSchema)
    .where(eq(categoriesSchema.departmentId, id));

  return {
    ...department,
    categories: departmentCategories,
  };
}

/**
 * Get department with its categories by slug
 */
export async function getDepartmentWithCategoriesBySlug(
  slug: string,
): Promise<DepartmentWithCategories | null> {
  const department = await getDepartmentBySlug(slug);
  if (!department) {
    return null;
  }

  // Get categories for this department
  const departmentCategories = await db
    .select()
    .from(categoriesSchema)
    .where(eq(categoriesSchema.departmentId, department.id));

  // Get article counts for each category
  const categoryIds = departmentCategories.map((c) => c.id);
  const articleCountsByCategory = await db
    .select({
      categoryId: articlesSchema.categoryId,
      count: count(),
    })
    .from(articlesSchema)
    .where(inArray(articlesSchema.categoryId, categoryIds))
    .groupBy(articlesSchema.categoryId);

  // Create a map of category ID to article count
  const categoryArticleCounts: Record<string, number> = {};
  articleCountsByCategory.forEach((ac) => {
    if (ac.categoryId) {
      categoryArticleCounts[ac.categoryId] = Number(ac.count);
    }
  });

  // Calculate total department article count
  const departmentArticleCount = Object.values(categoryArticleCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Add article counts to categories
  const categoriesWithCounts = departmentCategories.map((cat) => ({
    ...cat,
    articleCount: categoryArticleCounts[cat.id] || 0,
  }));

  return {
    ...department,
    articleCount: departmentArticleCount,
    categories: categoriesWithCounts,
  };
}

/**
 * List all departments with article counts
 */
export async function listDepartments() {
  // First get all departments
  const departments = await db
    .select()
    .from(departmentsSchema)
    .orderBy(departmentsSchema.name);

  // Get categories for all departments
  const departmentIds = departments.map((d) => d.id);
  const categories = await db
    .select()
    .from(categoriesSchema)
    .where(inArray(categoriesSchema.departmentId, departmentIds));

  // Get article counts by category
  const categoryIds = categories.map((c) => c.id);
  const articleCountsByCategory = await db
    .select({
      categoryId: articlesSchema.categoryId,
      count: count(),
    })
    .from(articlesSchema)
    .where(inArray(articlesSchema.categoryId, categoryIds))
    .groupBy(articlesSchema.categoryId);

  // Map counts to the right categories and sum them up by department
  const departmentArticleCounts: Record<string, number> = {};

  // Initialize with zero counts
  departmentIds.forEach((deptId) => {
    departmentArticleCounts[deptId] = 0;
  });

  // Create a mapping of category to department
  const categoryToDepartment: Record<string, string> = {};
  categories.forEach((cat) => {
    categoryToDepartment[cat.id] = cat.departmentId;
  });

  // Sum up article counts by department
  articleCountsByCategory.forEach((ac) => {
    if (ac.categoryId) {
      const deptId = categoryToDepartment[ac.categoryId];
      if (deptId) {
        departmentArticleCounts[deptId] += Number(ac.count);
      }
    }
  });

  // Add counts to department objects
  return departments.map((dept) => ({
    ...dept,
    articleCount: departmentArticleCounts[dept.id] || 0,
  }));
}

/**
 * Delete a department (will cascade to categories and articles)
 */
export async function deleteDepartment(id: string) {
  await db.delete(departmentsSchema).where(eq(departmentsSchema.id, id));

  return { success: true };
}

/**
 * Get the count of articles in each department
 */
export async function getDepartmentsWithArticleCounts() {
  return db
    .select({
      id: departmentsSchema.id,
      name: departmentsSchema.name,
      articleCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${articlesSchema}
        WHERE ${articlesSchema}.departmentId = ${departmentsSchema}.id
      )`,
    })
    .from(departmentsSchema)
    .orderBy(departmentsSchema.name);
}
