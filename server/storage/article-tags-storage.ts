/**
 * Article Tags Storage Implementation
 *
 * Implements article tag-related storage operations
 */
import { BaseStorage } from "@server/storage/base";
import {
  ArticleTagInsert,
  ArticleTagSelect,
  articleTagsSchema,
} from "@shared/schemas/db/article-tags";
import { eq } from "drizzle-orm";

export class ArticleTagsStorage extends BaseStorage {
  // Create a new tag for an article
  async createArticleTag(tag: ArticleTagInsert): Promise<ArticleTagSelect> {
    const [newTag] = await this.db
      .insert(articleTagsSchema)
      .values(tag)
      .returning();
    return newTag;
  }

  // Get all tags for an article
  async getArticleTagsByArticleId(
    articleId: string,
  ): Promise<ArticleTagSelect[]> {
    return this.db
      .select()
      .from(articleTagsSchema)
      .where(eq(articleTagsSchema.articleId, articleId))
      .orderBy(articleTagsSchema.name);
  }

  // Delete a tag by id
  async deleteArticleTag(id: string): Promise<ArticleTagSelect[]> {
    return this.db
      .delete(articleTagsSchema)
      .where(eq(articleTagsSchema.id, id))
      .returning();
  }

  // Delete all tags for an article
  async deleteArticleTagsByArticleId(
    articleId: string,
  ): Promise<ArticleTagSelect[]> {
    return this.db
      .delete(articleTagsSchema)
      .where(eq(articleTagsSchema.articleId, articleId))
      .returning();
  }

  // Update existing tag
  async updateArticleTag(id: string, name: string): Promise<ArticleTagSelect> {
    const [updatedTag] = await this.db
      .update(articleTagsSchema)
      .set({ name })
      .where(eq(articleTagsSchema.id, id))
      .returning();
    return updatedTag;
  }
}
