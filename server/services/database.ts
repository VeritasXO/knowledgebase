import { db } from "@server/db";
import { log } from "@server/vite";
import { settingsSchema } from "@shared/schemas/db";
import { execSync } from "child_process";
import { count } from "drizzle-orm";

/**
 * Service for database initialization and management
 */
export class DatabaseService {
  /**
   * Initializes the database by running migrations and setting up default values
   */
  static async init() {
    try {
      const hasSystemSettings = await db
        .select()
        .from(settingsSchema)
        .limit(1)
        .catch(() => []);

      if (!hasSystemSettings.length) {
        log("Database appears to be empty. Running initial setup...", "db");

        // Run drizzle-kit push to create tables
        log("Creating database schema...", "db");
        try {
          execSync("npx drizzle-kit push", { stdio: "inherit" });
        } catch (error) {
          console.error("Failed to run drizzle-kit push:", error);
          throw new Error("Database schema creation failed");
        }

        log("Adding default system settings...", "db");
        await db.insert(settingsSchema).values({});

        log("Database initialization completed successfully!", "db");
      }
    } catch (error) {
      log("Database initialization failed: " + error, "db");
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  static async runMigrations() {
    try {
      log("Running database migrations...", "db");
      execSync("npx drizzle-kit push", { stdio: "inherit" });
      log("Migrations completed successfully", "db");
      return true;
    } catch (error) {
      log("Failed to run migrations: " + error, "db");
      return false;
    }
  }

  /**
   * Check database connection
   */
  static async checkConnection() {
    try {
      // Perform a simple query to check if database connection is working
      await db.select({ count: count() }).from(settingsSchema);
      return true;
    } catch (error) {
      log("Database connection check failed: " + error, "db");
      return false;
    }
  }
}
