import {
  hasRole,
  isAuthenticated,
  updateSessionUser,
} from "@server/middleware/auth";
import { EmailService } from "@server/services/email-service";
import { EmailTemplates } from "@server/services/email-templates";
import { storage } from "@server/storage";
import { ADMIN_ROLES } from "@shared/constants";
import { insertUserSchema, updateUserSchema } from "@shared/schemas/validation";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

// Create a password change schema
const changePasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export function createAdminUsersRoutes() {
  const router = Router();

  // Get all admin users
  router.get(
    "/",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const users = await storage.user.getAllUsers();

        // Remove passwords from response
        const sanitizedUsers = users.map((user) => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });

        res.json(sanitizedUsers);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to fetch users",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  // Create a new admin user
  router.post(
    "/",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const result = insertUserSchema.safeParse(req.body);

        if (!result.success) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Validation failed",
            errors: result.error.format(),
          });
        }

        // Extract validated data
        const validatedData = result.data;

        const rawPassword = validatedData.password;
        const role = validatedData.role;
        const email = validatedData.email;

        const settings = await storage.settings.getSettings();

        if (!settings.googleAccountEmail) {
          throw new Error("Google account email not set.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Create the user
        const user = await storage.user.createUser({
          password: hashedPassword,
          role,
          email,
        });

        // Prepare user response without password
        const { password, ...userResponseData } = user;

        // Use the raw password value for the welcome email

        // Send welcome email - don't let this block the main user creation flow
        try {
          const loginUrl = `${process.env.APP_URL}/admin/login`;
          const subject = `Welcome to Becovic Knowledge Base`;
          const html = EmailTemplates.renderEmail("new-user-welcome.html", {
            email: user.email,
            password: rawPassword,
            role,
            loginUrl,
          });

          await EmailService.sendEmail({
            to: email,
            subject,
            html,
          });
          console.log("Welcome email sent to:", email);
        } catch (error) {
          console.error("Error preparing welcome email:", error);
        }

        // Send the response with user data (without password)
        res.status(StatusCodes.CREATED).json(userResponseData);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to create user",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  // Update an admin user
  router.put(
    "/:id",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        if (!id) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID" });
        }

        // Validate using the schema
        const result = updateUserSchema.safeParse(req.body);

        if (!result.success) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Validation failed",
            errors: result.error.format(),
          });
        }

        const userData = await storage.user.getUser(id);

        if (!userData) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        // Extract validated data
        const validatedData = result.data;
        const oldEmail = userData.email;
        const newEmail = validatedData.email;
        const isEmailChanged = oldEmail !== newEmail;

        // Update the user
        const updatedUser = await storage.user.updateUser(id, validatedData);

        if (!updatedUser) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        if (isEmailChanged) {
          EmailService.sendEmailChanged(userData.email, updatedUser);
        }

        // Update the session if this is the currently logged-in user
        // Import updateSessionUser from auth middleware at the top of the file
        if (req.session && req.session.user) {
          updateSessionUser(req, updatedUser);
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json(userWithoutPassword);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to update user",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  // Dedicated route for password changes
  router.put(
    "/:id/password-reset",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        if (!id) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID" });
        }

        const userData = await storage.user.getUser(id);

        if (!userData) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        // Validate the password
        const result = changePasswordSchema.safeParse(req.body);

        if (!result.success) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Validation failed",
            errors: result.error.format(),
          });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(result.data.password, 10);

        // Update only the password field
        const updatedUser = await storage.user.updateUser(id, {
          password: hashedPassword,
        });

        if (!updatedUser) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        // If this is the currently logged-in user, update their session
        if (req.session && req.session.user) {
          updateSessionUser(req, updatedUser);
        }

        // Attempt to send password changed email notification
        try {
          const settings = await storage.settings.getSettings();

          if (settings.googleAccountEmail) {
            const subject = `Your Becovic Knowledge Base Password Has Been Changed`;
            const html = EmailTemplates.renderEmail(
              "password-changed.html",
              {},
            );

            await EmailService.sendEmail({
              to: updatedUser.email,
              subject,
              html,
            });
          }
        } catch (emailError) {
          console.error(
            "Failed to send password change notification email:",
            emailError,
          );
          // Don't fail the request if email sending fails
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json(userWithoutPassword);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to update password",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  // Delete a user
  router.delete(
    "/:id",
    isAuthenticated,
    hasRole([ADMIN_ROLES.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        if (!id) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID" });
        }

        const userToDelete = await storage.user.getUser(id);

        if (!userToDelete) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        const success = await storage.user.deleteUser(id);

        if (!success) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }

        res.json({ message: "User removed successfully" });
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to remove user",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  return router;
}
