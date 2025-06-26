import { log } from "@server/vite";
import * as schema from "@shared/schemas/db";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

if (!process.env.DATABASE_NAME) {
  throw new Error("Missing DATABASE_NAME");
}

if (!process.env.DATABASE_HOST) {
  throw new Error("Missing DATABASE_HOST");
}

log(`Name: ${process.env.DATABASE_NAME}`, "db");
log(`Host: ${process.env.DATABASE_HOST}`, "db");
log(`Port: ${process.env.DATABASE_PORT}`, "db");
log(`User: ${process.env.DATABASE_USER}`, "db");

export const pool = new pg.Pool({
  application_name: process.env.APP_NAME,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASS,
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  user: process.env.DATABASE_USER,
});

export const db = drizzle({ client: pool, schema });
