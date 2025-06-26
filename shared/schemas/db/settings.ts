import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// System-wide settings
export const settingsSchema = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleAccountEmail: text("google_account_email"),
  websiteTitle: text("website_title").default("Knowledge Base").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ServerSettings = typeof settingsSchema.$inferSelect;
