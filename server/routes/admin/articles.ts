/**
 * Articles API routes
 */
import { hasRole, isAuthenticated } from "@server/middleware/auth";
import { articlesService } from "@server/services/articles-service";
import {
  articleFormSchema,
  articleSearchSchema,
} from "@shared/schemas/validation/articles";
import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";

export function createAdminArticlesRoutes() {
  const router = Router();

  // Validate request body against Zod schema
  const validateBody =
    (schema: z.ZodType<any, any>) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res
            .status(400)
            .json({ message: "Validation error", errors: error.errors });
        } else {
          next(error);
        }
      }
    };

  // Validate request query against Zod schema
  const validateQuery =
    (schema: z.ZodType<any, any>) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        req.query = schema.parse(req.query);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res
            .status(400)
            .json({ message: "Validation error", errors: error.errors });
        } else {
          next(error);
        }
      }
    };

  // Get article stats
  router.get("/stats", isAuthenticated, async (req: Request, res: Response) => {
    const stats = await articlesService.getArticleStats();
    res.json(stats);
  });

  // Get pinned articles
  router.get("/pinned", async (req: Request, res: Response) => {
    const articles = await articlesService.getPinnedArticles();
    res.json(articles);
  });

  // Get recent articles
  router.get("/recent", async (req: Request, res: Response) => {
    const articles = await articlesService.getRecentArticles();
    res.json(articles);
  });

  // Get article by slug
  router.get("/by-slug/:slug", async (req: Request, res: Response) => {
    // First get the article
    const article = await articlesService.getArticleBySlug(
      req.params.slug,
      req.session.user?.role,
    );

    // Then get the tags
    const tags = await articlesService.getArticleTags(article.id);

    // Return article with tags
    res.json({
      ...article,
      tags,
    });
  });

  // Get article by ID
  router.get("/:id", async (req: Request, res: Response) => {
    const article = await articlesService.getArticleWithTags(
      req.params.id,
      req.session.user?.role,
    );
    res.json(article);
  });

  // List articles with search/filter
  router.get(
    "/",
    validateQuery(articleSearchSchema),
    async (req: Request, res: Response) => {
      const { query, limit, offset, authorId, departmentSlug, categoryId } =
        req.query as {
          query?: string;
          limit?: number;
          offset?: number;
          authorId?: string;
          departmentSlug?: string;
          categoryId?: string;
        };

      const result = await articlesService.listArticles(
        {
          query,
          limit,
          offset,
          authorId,
          departmentSlug,
          categoryId,
        },
        req.session.user?.role,
      );
      res.json(result);
    },
  );

  // Create article (requires authentication and editor/admin role)
  router.post(
    "/",
    isAuthenticated,
    hasRole(["admin", "editor"]),
    validateBody(articleFormSchema),
    async (req: Request, res: Response) => {
      const article = await articlesService.createArticle(
        req.session.user!.id,
        req.body,
      );
      res.status(201).json(article);
    },
  );

  // Update article (requires authentication and appropriate permissions)
  router.put(
    "/:id",
    isAuthenticated,
    hasRole(["admin", "editor"]),
    validateBody(articleFormSchema),
    async (req: Request, res: Response) => {
      const article = await articlesService.updateArticle(
        req.session.user!.id,
        req.params.id,
        req.body,
        req.session.user!.role,
      );
      res.json(article);
    },
  );

  // Delete article (requires authentication and appropriate permissions)
  router.delete(
    "/:id",
    isAuthenticated,
    hasRole(["admin", "editor"]),
    async (req: Request, res: Response) => {
      await articlesService.deleteArticle(
        req.session.user!.id,
        req.params.id,
        req.session.user!.role,
      );
      res.status(204).end();
    },
  );

  return router;
}
