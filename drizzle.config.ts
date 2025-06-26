import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_NAME) {
  throw new Error("Missing DATABASE_NAME");
}

if (!process.env.DATABASE_HOST) {
  throw new Error("Missing DATABASE_HOST");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schemas/db",
  dialect: "postgresql",
  dbCredentials: {
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASS,
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    user: process.env.DATABASE_USER,
    ssl: { rejectUnauthorized: process.env.NODE_ENV === "production" },
  },
});
