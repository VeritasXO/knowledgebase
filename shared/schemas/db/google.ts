import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const googleSchema = pgTable("google_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  access_token: text("access_token").notNull(),
  refresh_token: text("refresh_token").notNull(),
  token_expiry: timestamp("token_expiry").notNull(),
});
