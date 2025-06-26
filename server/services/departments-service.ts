import { ForbiddenError, NotFoundError } from "@server/services/errors";
import * as categoriesStorage from "@server/storage/categories-storage";
import * as departmentsStorage from "@server/storage/departments-storage";
import {
  CategoryForm,
  DepartmentForm,
} from "@shared/schemas/validation/departments";

export class DepartmentsService {
  /**
   * Create a new department
   */
  static async createDepartment(data: DepartmentForm) {
    return departmentsStorage.createDepartment(data);
  }

  /**
   * Update an existing department
   */
  static async updateDepartment(
    id: string,
    data: Partial<DepartmentForm>,
    userRole?: string,
  ) {
    // Check if department exists
    const department = await departmentsStorage.getDepartmentById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    // Only admins can update departments
    if (userRole !== "admin") {
      throw new ForbiddenError("Only admins can update departments");
    }

    return departmentsStorage.updateDepartment(id, data);
  }

  /**
   * Get a department by ID
   */
  static async getDepartmentById(id: string) {
    const department = await departmentsStorage.getDepartmentById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return department;
  }

  /**
   * Get a department by slug
   */
  static async getDepartmentBySlug(slug: string) {
    const department = await departmentsStorage.getDepartmentBySlug(slug);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return department;
  }

  /**
   * Get a department with its categories
   */
  static async getDepartmentWithCategories(id: string) {
    const department = await departmentsStorage.getDepartmentWithCategories(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return department;
  }

  /**
   * Get a department with its categories by slug
   */
  static async getDepartmentWithCategoriesBySlug(slug: string) {
    const department =
      await departmentsStorage.getDepartmentWithCategoriesBySlug(slug);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return department;
  }

  /**
   * List all departments
   */
  static async listDepartments() {
    return departmentsStorage.listDepartments();
  }

  /**
   * Delete a department
   */
  static async deleteDepartment(id: string, userRole?: string) {
    // Check if department exists
    const department = await departmentsStorage.getDepartmentById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    // Only admins can delete departments
    if (userRole !== "admin") {
      throw new ForbiddenError("Only admins can delete departments");
    }

    return departmentsStorage.deleteDepartment(id);
  }

  /**
   * Create a new category
   */
  static async createCategory(data: CategoryForm) {
    // Check if department exists
    const department = await departmentsStorage.getDepartmentById(
      data.departmentId,
    );
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    return categoriesStorage.createCategory(data);
  }

  /**
   * Update an existing category
   */
  static async updateCategory(
    id: string,
    data: Partial<CategoryForm>,
    userRole?: string,
  ) {
    // Check if category exists
    const category = await categoriesStorage.getCategoryById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Only admins can update categories
    if (userRole !== "admin") {
      throw new ForbiddenError("Only admins can update categories");
    }

    return categoriesStorage.updateCategory(id, data);
  }

  /**
   * Get a category by ID
   */
  static async getCategoryById(id: string) {
    const category = await categoriesStorage.getCategoryById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  }

  /**
   * Get a category by slug within a department
   */
  static async getCategoryBySlug(departmentId: string, slug: string) {
    // Check if department exists
    const department = await departmentsStorage.getDepartmentById(departmentId);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    const category = await categoriesStorage.getCategoryBySlug(
      departmentId,
      slug,
    );
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }

  /**
   * List all categories for a department
   */
  static async listCategoriesForDepartment(departmentId: string) {
    // Check if department exists
    const department = await departmentsStorage.getDepartmentById(departmentId);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    return categoriesStorage.listCategoriesForDepartment(departmentId);
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string, userRole?: string) {
    // Check if category exists
    const category = await categoriesStorage.getCategoryById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Only admins can delete categories
    if (userRole !== "admin") {
      throw new ForbiddenError("Only admins can delete categories");
    }

    return categoriesStorage.deleteCategory(id);
  }
}
