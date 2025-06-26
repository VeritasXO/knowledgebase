import type { UserSelect } from "@shared/schemas/db";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// Role-based access control middleware

export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized: Please log in" });
    }

    if (roles.includes(req.session.user.role)) {
      return next();
    }

    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Forbidden: Insufficient permissions" });
  };
};

// Authentication middleware

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "Unauthorized: Please log in" });
};

/**
 * Updates the user data in the session without requiring re-login
 * @param req Express request object
 * @param userData User data to update (password will be removed)
 * @returns boolean indicating if the session was updated
 */
export const updateSessionUser = (
  req: Request,
  userData: Partial<UserSelect> & { id: string },
): boolean => {
  if (!req.session || !req.session.user) {
    return false;
  }

  // Only update if this is the current logged in user
  if (req.session.user.id === userData.id) {
    // Merge the new data with existing session data (excluding password)
    const { password, ...userWithoutPassword } = {
      ...req.session.user,
      ...userData,
    };

    // Update the session
    req.session.user = userWithoutPassword;
    return true;
  }

  return false;
};
