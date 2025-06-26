import { createGoogleRoutes } from "@server/routes/integrations/google";
import { Router } from "express";

export function createIntegrationsRoutes() {
  const router = Router();

  // Mount Google OAuth routes
  router.use("/google", createGoogleRoutes());

  return router;
}
