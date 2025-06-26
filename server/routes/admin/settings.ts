import { hasRole, isAuthenticated } from "@server/middleware/auth";
import { storage } from "@server/storage";
import { ADMIN_ROLES } from "@shared/constants";
import { updateSettingsSchema } from "@shared/schemas/validation";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { fromZodError } from "zod-validation-error";

export function createAdminSettingsRoutes() {
  const router = Router();

  // Get system settings
  router.get(
    "/",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const settings = await storage.settings.getSettings();
        res.json(settings);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to fetch system settings",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  // Update system settings
  router.put(
    "/",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        // Validate the request body using the schema
        const result = updateSettingsSchema.safeParse(req.body);

        if (!result.success) {
          const validationError = fromZodError(result.error);
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Validation failed",
            errors: validationError.details,
          });
        }

        const updatedSettings = await storage.settings.updateSettings(
          result.data,
        );

        res.json(updatedSettings);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to update system settings",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  return router;
}
