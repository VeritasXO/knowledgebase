import { isAuthenticated } from "@server/middleware/auth";
import { storage } from "@server/storage";
import { ADMIN_ROLES } from "@shared/constants";
import { adminLoginSchema } from "@shared/schemas/validation";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export function createAuthRoutes() {
  const router = Router();

  // Admin login
  router.post("/login", async (req: Request, res: Response) => {
    try {
      const loginData = adminLoginSchema.parse(req.body);
      const user = await storage.user.getUserByEmail(loginData.email);

      if (!user || !user.password) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(
        loginData.password,
        user.password,
      );

      if (!isValidPassword) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }

      // Check if the user has admin role
      if (!user.role || !Object.values(ADMIN_ROLES).includes(user.role)) {
        return res
          .status(403)
          .json({ message: "You do not have admin privileges" });
      }

      // Create user session
      if (req.session) {
        // Store user info in session (exclude password)
        const { password, ...userInfo } = user;
        req.session.user = userInfo;
      }

      // Return user info (exclude password)
      const { password, ...userInfo } = user;
      res.json({
        message: "Login successful",
        user: userInfo,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Validation failed",
          errors: validationError.details,
        });
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Login failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Admin logout
  router.post("/logout", (req: Request, res: Response) => {
    if (req.session && req.session.user) {
      const userId = req.session.user.id;
      const email = req.session.user.email;

      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Logout failed", error: err.message });
        }

        res.json({ message: "Logout successful" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });

  // Get current admin user
  router.get("/me", isAuthenticated, async (req: Request, res: Response) => {
    if (req.session && req.session.user) {
      const user = await storage.user.getUser(req.session.user.id);
      res.json(user);
    } else {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Not authenticated" });
    }
  });

  return router;
}
