import { ADMIN_ROLES } from "@shared/constants";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersSchema = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: text("role").notNull().$type<UserRoles>().default(ADMIN_ROLES.ADMIN),
});

export type UserSelect = typeof usersSchema.$inferSelect;
export type UserNew = typeof usersSchema.$inferInsert;

export type UserRoles = "admin" | "editor";
export type UserWithoutPassword = Omit<UserSelect, "password">;
