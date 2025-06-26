import type { UserRoles } from "@shared/schemas/db";

// Admin roles and other constants
export const ADMIN_ROLES: Record<string, UserRoles> = {
  ADMIN: "admin",
  EDITOR: "editor",
};
