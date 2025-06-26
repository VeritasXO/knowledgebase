/**
 * Departments and Categories API routes
 */
import { hasRole, isAuthenticated } from "@server/middleware/auth";
import { DepartmentsService } from "@server/services/departments-service";
import { ADMIN_ROLES } from "@shared/constants";
import {
  categoryFormSchema,
  departmentFormSchema,
} from "@shared/schemas/validation/departments";
import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";

export function createAdminStructureRoutes() {
  const router = Router();

  // Middleware for validating request body against Zod schema
  const validateBody =
    (schema: z.ZodType<any, any>) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res
            .status(400)
            .json({ message: "Validation error", errors: error.errors });
        } else {
          next(error);
        }
      }
    };

  // ======= DEPARTMENTS ROUTES =======

  // List all departments
  router.get("/departments", async (req: Request, res: Response) => {
    const departments = await DepartmentsService.listDepartments();
    res.json(departments);
  });

  // Get department by ID
  router.get("/departments/:id", async (req: Request, res: Response) => {
    const department = await DepartmentsService.getDepartmentById(
      req.params.id,
    );
    res.json(department);
  });

  // Get department by slug with categories
  router.get(
    "/departments/by-slug/:slug",
    async (req: Request, res: Response) => {
      const department =
        await DepartmentsService.getDepartmentWithCategoriesBySlug(
          req.params.slug,
        );
      res.json(department);
    },
  );
  // Create a department (requires admin)
  router.post(
    "/departments",
    isAuthenticated,
    hasRole(["admin"]),
    validateBody(departmentFormSchema),
    async (req: Request, res: Response) => {
      const department = await DepartmentsService.createDepartment(req.body);
      res.status(201).json(department);
    },
  );

  // Update a department (requires admin)
  router.put(
    "/departments/:id",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    validateBody(departmentFormSchema),
    async (req: Request, res: Response) => {
      const department = await DepartmentsService.updateDepartment(
        req.params.id,
        req.body,
        req.session.user?.role,
      );
      res.json(department);
    },
  );

  // Delete a department (requires admin)
  router.delete(
    "/departments/:id",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      await DepartmentsService.deleteDepartment(
        req.params.id,
        req.session.user?.role,
      );
      res.status(204).end();
    },
  );

  // ======= CATEGORIES ROUTES =======

  // List categories for department
  router.get(
    "/departments/:id/categories",
    async (req: Request, res: Response) => {
      const categories = await DepartmentsService.listCategoriesForDepartment(
        req.params.id,
      );
      res.json(categories);
    },
  );

  // Get category by ID
  router.get("/categories/:id", async (req: Request, res: Response) => {
    const category = await DepartmentsService.getCategoryById(req.params.id);
    res.json(category);
  });

  // Create a category (requires admin)
  router.post(
    "/categories",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    validateBody(categoryFormSchema),
    async (req: Request, res: Response) => {
      const category = await DepartmentsService.createCategory(req.body);
      res.status(201).json(category);
    },
  );

  // Update a category (requires admin)
  router.put(
    "/categories/:id",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    validateBody(categoryFormSchema),
    async (req: Request, res: Response) => {
      const category = await DepartmentsService.updateCategory(
        req.params.id,
        req.body,
        req.session.user?.role,
      );
      res.json(category);
    },
  );

  // Delete a category (requires admin)
  router.delete(
    "/categories/:id",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      await DepartmentsService.deleteCategory(
        req.params.id,
        req.session.user?.role,
      );
      res.status(204).end();
    },
  );

  return router;
}
