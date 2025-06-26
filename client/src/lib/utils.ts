import { ADMIN_ROLES } from "@shared/constants";
import type { UserRoles } from "@shared/schemas/db";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a URL-friendly slug from a string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Format role name for display
export const formatRoleName = (role: UserRoles) => {
  switch (role) {
    case ADMIN_ROLES.ADMIN:
      return "Admin";
    case ADMIN_ROLES.EDITOR:
      return "Editor";
    default:
      return role;
  }
};
