import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// User sessions table
export const userSessions = pgTable("user_sessions", {
  sid: text("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
