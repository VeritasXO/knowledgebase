import { createAdminArticlesRoutes } from "@server/routes/admin/articles";
import { createAdminDashboardRoutes } from "@server/routes/admin/dashboard";
import departmentUploadsRouter from "@server/routes/admin/department-uploads";
import { createAdminSettingsRoutes } from "@server/routes/admin/settings";
import { createAdminStructureRoutes } from "@server/routes/admin/structure";
import uploadsRouter from "@server/routes/admin/uploads";
import { createAdminUsersRoutes } from "@server/routes/admin/users";
import { createIntegrationsRoutes } from "@server/routes/integrations";
import { createAuthRoutes } from "@server/routes/public/auth";
import { createSettingsRoutes } from "@server/routes/public/settings";
import { Router } from "express";

export function createRoutes() {
  const router = Router();
  router.use("/admin/dashboard", createAdminDashboardRoutes());
  router.use("/admin/settings", createAdminSettingsRoutes());
  router.use("/admin/articles", createAdminArticlesRoutes());
  router.use("/admin/structure", createAdminStructureRoutes());
  router.use("/admin/uploads", uploadsRouter);
  router.use("/admin/department-uploads", departmentUploadsRouter);
  router.use("/admin/users", createAdminUsersRoutes());

  router.use("/auth", createAuthRoutes());
  router.use("/integrations", createIntegrationsRoutes());
  router.use("/settings", createSettingsRoutes());

  return router;
}
