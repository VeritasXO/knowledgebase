import { hasRole, isAuthenticated } from "@server/middleware/auth";
import { ADMIN_ROLES } from "@shared/constants";
import { Request, Response, Router } from "express";

export function createAdminDashboardRoutes() {
  const router = Router();

  // Get dashboard statistics
  router.get(
    "/stats",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      res.json({
        stats: "OK",
      });
    },
  );

  return router;
}
