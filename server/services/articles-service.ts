/**
 * Articles Service
 *
 * Provides business logic for working with articles
 */
import { storage } from "@server/storage";
import { ADMIN_ROLES } from "@shared/constants";
import { ArticleInsert, ArticleSelect } from "@shared/schemas/db/articles";
import { ArticleForm } from "@shared/schemas/validation/articles";

interface ArticleListOptions {
  query?: string;
  limit?: number;
  offset?: number;
  authorId?: string;
  departmentSlug?: string;
  categoryId?: string;
  includeUnpublished?: boolean;
}

class ArticleNotFoundError extends Error {
  constructor(id: string) {
    super(`Article not found with ID: ${id}`);
    this.name = "ArticleNotFoundError";
  }
}

class InsufficientPermissionsError extends Error {
  constructor() {
    super(
      "User does not have sufficient permissions to perform this operation",
    );
    this.name = "InsufficientPermissionsError";
  }
}

export class ArticlesService {
  async createArticle(
    userId: string,
    data: ArticleForm,
  ): Promise<ArticleSelect> {
    // Create article
    const articleData: Omit<ArticleInsert, "slug"> = {
      title: data.title,
      content: data.content,
      summary: data.summary,
      isPinned: data.isPinned,
      isPublished: data.isPublished,
      authorId: userId,
      categoryId: data.categoryId,
    };

    // Create the article first
    const article = await storage.articles.createArticle(articleData);

    // Then create all the tags
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        await storage.articleTags.createArticleTag({
          articleId: article.id,
          name: tag.name,
        });
      }
    }

    return article;
  }

  async updateArticle(
    userId: string,
    id: string,
    data: ArticleForm,
    userRole: string,
  ): Promise<ArticleSelect> {
    // Get article first to check ownership
    const article = await storage.articles.getArticleById(id);

    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    // Check if user has permission (is author or admin)
    if (
      article.authorId !== userId &&
      userRole !== "admin" &&
      userRole !== "editor"
    ) {
      throw new InsufficientPermissionsError();
    }

    // Update article
    const updateResult = await storage.articles.updateArticle({
      id,
      title: data.title,
      content: data.content,
      summary: data.summary,
      isPinned: data.isPinned,
      isPublished: data.isPublished,
      categoryId: data.categoryId,
    });

    if (!updateResult) {
      throw new ArticleNotFoundError(id);
    }

    // Handle tags update
    // First, get existing tags for this article
    const existingTags =
      await storage.articleTags.getArticleTagsByArticleId(id);

    // Update or create tags as needed
    if (data.tags && data.tags.length > 0) {
      // Map for easier lookup
      const existingTagsMap = new Map(existingTags.map((tag) => [tag.id, tag]));

      // Process each tag from the form
      for (const tag of data.tags) {
        if (tag.id) {
          // Tag exists - check if it needs to be updated
          const existingTag = existingTagsMap.get(tag.id);
          if (existingTag && existingTag.name !== tag.name) {
            // Update tag name
            await storage.articleTags.updateArticleTag(tag.id, tag.name);
          }
          // Remove from map to track which ones are processed
          existingTagsMap.delete(tag.id);
        } else {
          // New tag - create it
          await storage.articleTags.createArticleTag({
            articleId: id,
            name: tag.name,
          });
        }
      }

      // Delete any tags that weren't included in the update
      existingTagsMap.forEach(async (_, tagId) => {
        await storage.articleTags.deleteArticleTag(tagId);
      });
    } else {
      // No tags in the update - delete all existing tags
      await storage.articleTags.deleteArticleTagsByArticleId(id);
    }

    return updateResult;
  }

  async getArticleById(id: string, userRole?: string): Promise<ArticleSelect> {
    const article = await storage.articles.getArticleById(id);

    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    // If article is not published and user is not admin/editor, don't allow access
    if (
      !article.isPublished &&
      userRole !== ADMIN_ROLES.ADMIN &&
      userRole !== ADMIN_ROLES.EDITOR
    ) {
      throw new InsufficientPermissionsError();
    }

    return article;
  }

  async getArticleBySlug(
    slug: string,
    userRole?: string,
  ): Promise<ArticleSelect> {
    const article = await storage.articles.getArticleBySlug(slug);

    if (!article) {
      throw new ArticleNotFoundError(`with slug: ${slug}`);
    }

    // If article is not published and user is not admin/editor, don't allow access
    if (!article.isPublished && userRole !== "admin" && userRole !== "editor") {
      throw new InsufficientPermissionsError();
    }

    return article;
  }

  async deleteArticle(
    userId: string,
    id: string,
    userRole: string,
  ): Promise<boolean> {
    // Get article first to check ownership
    const article = await storage.articles.getArticleById(id);

    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    // Check if user has permission (is author or admin)
    if (
      article.authorId !== userId &&
      userRole !== "admin" &&
      userRole !== "editor"
    ) {
      throw new InsufficientPermissionsError();
    }

    // Delete article
    return await storage.articles.deleteArticle(id);
  }

  async listArticles(
    options: ArticleListOptions = {},
    userRole?: string,
  ): Promise<{ articles: ArticleSelect[]; total: number }> {
    // Only admins and editors can see unpublished articles that aren't their own
    const includeUnpublished = userRole === "admin" || userRole === "editor";

    // Get the articles
    const result = await storage.articles.listArticles({
      ...options,
      includeUnpublished,
    });

    // Add tags to each article
    const articlesWithTags = await Promise.all(
      result.articles.map(async (article) => {
        const tags = await this.getArticleTags(article.id);
        return {
          ...article,
          tags,
        };
      }),
    );

    return {
      articles: articlesWithTags,
      total: result.total,
    };
  }

  async getPinnedArticles(limit = 5): Promise<ArticleSelect[]> {
    return await storage.articles.getPinnedArticles(limit);
  }

  async getRecentArticles(limit = 5): Promise<ArticleSelect[]> {
    return await storage.articles.getRecentArticles(limit);
  }

  async getArticleStats(): Promise<{
    total: number;
    published: number;
    pinned: number;
  }> {
    return await storage.articles.getArticleStats();
  }

  async getArticleTags(articleId: string) {
    const tags = await storage.articleTags.getArticleTagsByArticleId(articleId);
    // Transform tags to have only id and name (no articleId)
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    }));
  }

  async getArticleWithTags(id: string, userRole?: string) {
    const article = await this.getArticleById(id, userRole);
    const tags = await this.getArticleTags(id);

    return {
      ...article,
      tags,
    };
  }
}

// Export a singleton instance
export const articlesService = new ArticlesService();
