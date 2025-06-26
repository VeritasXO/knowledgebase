import { storage } from "@server/storage";
import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

export function createSettingsRoutes() {
  const router = Router();

  // Public endpoint to get system settings (read-only, limited fields)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const clientSettings = await storage.settings.getClientSettings();

      res.json(clientSettings);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to fetch system settings",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return router;
}
