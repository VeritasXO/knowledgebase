import { pool } from "@server/db";
import { createRoutes } from "@server/routes/index";
import { DatabaseService } from "@server/services/database";
import { log, serveStatic, setupVite } from "@server/vite";
import { UserSelect } from "@shared/schemas/db";
import pgSessionStore from "connect-pg-simple";
import express, { type NextFunction, type Request, Response } from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// Extend the Express session with our User type
declare module "express-session" {
  interface SessionData {
    user?: Omit<UserSelect, "password">;
  }
}

const currentFile = fileURLToPath(import.meta.url);
export const serverRoot = path.dirname(currentFile);
export const projectRoot = path.dirname(serverRoot);

log(`Env: ${process.env.NODE_ENV}`, "server");
log(`Root: ${serverRoot}`, "server");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Serve static files from the public directory
app.use(express.static(path.join(serverRoot, "public")));

// Setup PostgreSQL session store
const PgSession = pgSessionStore(session);

// Configure session middleware
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "duplex-tower-super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);
app.set("trust proxy", 1);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await DatabaseService.init();

  app.use("/api", createRoutes());

  const server = createServer(app);

  // Fix the error handler middleware by adding the missing 'next' parameter
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.APP_PORT || 5000);
  const host = "0.0.0.0";
  server.listen({ port, host }, () => {
    log(`Port: ${port}`);
  });
})();
