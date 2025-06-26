/**
 * Articles Storage Implementation
 *
 * Implements article-related storage operations
 */
import { BaseStorage } from "@server/storage/base";
import {
  ArticleInsert,
  ArticleSelect,
  articlesSchema,
  ArticleUpdate,
} from "@shared/schemas/db/articles";
import { usersSchema } from "@shared/schemas/db/users";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

export class ArticlesStorage extends BaseStorage {
  async createArticle(
    data: Omit<ArticleInsert, "slug">,
  ): Promise<ArticleSelect> {
    // Generate slug from title
    const slug = this.createSlug(data.title);

    const [result] = await this.db
      .insert(articlesSchema)
      .values({
        ...data,
        slug,
      })
      .returning();

    return result;
  }

  async updateArticle(data: ArticleUpdate): Promise<ArticleSelect | undefined> {
    // Update slug if title has changed
    const values: ArticleUpdate = { ...data };

    if (data.title) {
      values.slug = this.createSlug(data.title);
    }

    values.updatedAt = new Date();

    const [result] = await this.db
      .update(articlesSchema)
      .set(values)
      .where(eq(articlesSchema.id, data.id))
      .returning();

    return result;
  }
  async getArticleById(id: string): Promise<
    | (ArticleSelect & {
        categorySlug?: string;
        departmentSlug?: string;
        categoryName?: string;
        departmentName?: string;
      })
    | undefined
  > {
    // Import needed schemas
    const { categoriesSchema } = await import("@shared/schemas/db/categories");
    const { departmentsSchema } = await import(
      "@shared/schemas/db/departments"
    );

    const [result] = await this.db
      .select({
        // Article fields
        id: articlesSchema.id,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        content: articlesSchema.content,
        summary: articlesSchema.summary,
        authorId: articlesSchema.authorId,
        categoryId: articlesSchema.categoryId,
        createdAt: articlesSchema.createdAt,
        updatedAt: articlesSchema.updatedAt,
        isPinned: articlesSchema.isPinned,
        isPublished: articlesSchema.isPublished,
        // Category and department fields
        categorySlug: categoriesSchema.slug,
        departmentSlug: departmentsSchema.slug,
        categoryName: categoriesSchema.name,
        departmentName: departmentsSchema.name,
      })
      .from(articlesSchema)
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(eq(articlesSchema.id, id));

    if (!result) return undefined;

    return {
      ...result,
      categorySlug: result.categorySlug || undefined,
      departmentSlug: result.departmentSlug || undefined,
      categoryName: result.categoryName || undefined,
      departmentName: result.departmentName || undefined,
    };
  }

  async getArticleBySlug(slug: string): Promise<
    | (ArticleSelect & {
        categorySlug?: string;
        departmentSlug?: string;
        categoryName?: string;
        departmentName?: string;
      })
    | undefined
  > {
    // Import needed schemas
    const { categoriesSchema } = await import("@shared/schemas/db/categories");
    const { departmentsSchema } = await import(
      "@shared/schemas/db/departments"
    );

    const [result] = await this.db
      .select({
        // Article fields
        id: articlesSchema.id,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        content: articlesSchema.content,
        summary: articlesSchema.summary,
        authorId: articlesSchema.authorId,
        categoryId: articlesSchema.categoryId,
        createdAt: articlesSchema.createdAt,
        updatedAt: articlesSchema.updatedAt,
        isPinned: articlesSchema.isPinned,
        isPublished: articlesSchema.isPublished,
        // Category and department fields
        categorySlug: categoriesSchema.slug,
        departmentSlug: departmentsSchema.slug,
        categoryName: categoriesSchema.name,
        departmentName: departmentsSchema.name,
      })
      .from(articlesSchema)
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(eq(articlesSchema.slug, slug));

    if (!result) return undefined;

    return {
      ...result,
      categorySlug: result.categorySlug || undefined,
      departmentSlug: result.departmentSlug || undefined,
      categoryName: result.categoryName || undefined,
      departmentName: result.departmentName || undefined,
    };
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await this.db
      .delete(articlesSchema)
      .where(eq(articlesSchema.id, id))
      .returning({ id: articlesSchema.id });

    return result.length > 0;
  }
  async listArticles({
    query = "",
    limit = 10,
    offset = 0,
    authorId,
    departmentSlug,
    categoryId,
    includeUnpublished = false,
  }: {
    query?: string;
    limit?: number;
    offset?: number;
    authorId?: string;
    departmentSlug?: string;
    categoryId?: string;
    includeUnpublished?: boolean;
  } = {}): Promise<{
    articles: (Omit<ArticleSelect, "categoryId"> & {
      categoryId: string | null;
      categorySlug?: string;
      departmentSlug?: string;
      categoryName?: string;
      departmentName?: string;
    })[];
    total: number;
  }> {
    // Import needed schemas
    const { categoriesSchema } = await import("@shared/schemas/db/categories");
    const { departmentsSchema } = await import(
      "@shared/schemas/db/departments"
    );

    const filters: any[] = [];

    if (query) {
      // Import article tags schema to use in the query
      const { articleTagsSchema } = await import(
        "@shared/schemas/db/article-tags"
      );

      // Add search by tag condition - using a subquery with EXISTS to find articles with matching tags
      filters.push(
        sql`(${ilike(articlesSchema.title, `%${query}%`)} OR 
            ${ilike(articlesSchema.summary, `%${query}%`)} OR
            EXISTS (
              SELECT 1 FROM ${articleTagsSchema}
              WHERE ${articleTagsSchema.articleId} = ${articlesSchema.id}
              AND ${ilike(articleTagsSchema.name, `%${query}%`)}
            )
          )`,
      );
    }
    if (authorId) {
      filters.push(eq(articlesSchema.authorId, authorId));
    }

    if (!includeUnpublished) {
      filters.push(eq(articlesSchema.isPublished, true));
    }

    // Filter by department slug if provided
    if (departmentSlug) {
      filters.push(eq(departmentsSchema.slug, departmentSlug));
    }

    // Filter by category ID if provided
    if (categoryId) {
      filters.push(eq(articlesSchema.categoryId, categoryId));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get articles with pagination, joining with categories and departments to get slugs
    const articlesResult = await this.db
      .select({
        // Article fields
        id: articlesSchema.id,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        content: articlesSchema.content,
        summary: articlesSchema.summary,
        authorId: articlesSchema.authorId,
        categoryId: articlesSchema.categoryId,
        createdAt: articlesSchema.createdAt,
        updatedAt: articlesSchema.updatedAt,
        isPinned: articlesSchema.isPinned,
        isPublished: articlesSchema.isPublished,
        // Category and department fields
        categorySlug: categoriesSchema.slug,
        departmentSlug: departmentsSchema.slug,
        categoryName: categoriesSchema.name,
        departmentName: departmentsSchema.name,
      })
      .from(articlesSchema)
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(whereClause)
      .orderBy(desc(articlesSchema.createdAt))
      .limit(limit)
      .offset(offset); // Get total count    // Get total count with the same joins to ensure the WHERE clause works correctly
    const [totalResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(articlesSchema)
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(whereClause);

    // Convert null values to undefined for the response
    const articles = articlesResult.map((article) => ({
      ...article,
      categorySlug: article.categorySlug || undefined,
      departmentSlug: article.departmentSlug || undefined,
      categoryName: article.categoryName || undefined,
      departmentName: article.departmentName || undefined,
    }));

    return {
      articles,
      total: totalResult.count,
    };
  }
  async getPinnedArticles(limit = 5): Promise<
    (ArticleSelect & {
      categorySlug?: string;
      departmentSlug?: string;
      categoryName?: string;
      departmentName?: string;
    })[]
  > {
    // Import needed schemas
    const { categoriesSchema } = await import("@shared/schemas/db/categories");
    const { departmentsSchema } = await import(
      "@shared/schemas/db/departments"
    );

    const results = await this.db
      .select({
        // Article fields
        id: articlesSchema.id,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        content: articlesSchema.content,
        summary: articlesSchema.summary,
        authorId: articlesSchema.authorId,
        categoryId: articlesSchema.categoryId,
        createdAt: articlesSchema.createdAt,
        updatedAt: articlesSchema.updatedAt,
        isPinned: articlesSchema.isPinned,
        isPublished: articlesSchema.isPublished,
        // Category and department fields
        categorySlug: categoriesSchema.slug,
        departmentSlug: departmentsSchema.slug,
        categoryName: categoriesSchema.name,
        departmentName: departmentsSchema.name,
      })
      .from(articlesSchema)
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(
        and(
          eq(articlesSchema.isPinned, true),
          eq(articlesSchema.isPublished, true),
        ),
      )
      .orderBy(desc(articlesSchema.updatedAt))
      .limit(limit);

    // Convert null values to undefined for the response
    return results.map((result) => ({
      ...result,
      categorySlug: result.categorySlug || undefined,
      departmentSlug: result.departmentSlug || undefined,
      categoryName: result.categoryName || undefined,
      departmentName: result.departmentName || undefined,
    }));
  }

  async getRecentArticles(limit = 5): Promise<
    (ArticleSelect & {
      categorySlug?: string;
      departmentSlug?: string;
      categoryName?: string;
      departmentName?: string;
    })[]
  > {
    // Import needed schemas
    const { categoriesSchema } = await import("@shared/schemas/db/categories");
    const { departmentsSchema } = await import(
      "@shared/schemas/db/departments"
    );

    const results = await this.db
      .select({
        // Article fields
        id: articlesSchema.id,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        content: articlesSchema.content,
        summary: articlesSchema.summary,
        authorId: articlesSchema.authorId,
        categoryId: articlesSchema.categoryId,
        createdAt: articlesSchema.createdAt,
        updatedAt: articlesSchema.updatedAt,
        isPinned: articlesSchema.isPinned,
        isPublished: articlesSchema.isPublished,
        // Category and department fields
        categorySlug: categoriesSchema.slug,
        departmentSlug: departmentsSchema.slug,
        categoryName: categoriesSchema.name,
        departmentName: departmentsSchema.name,
      })
      .from(articlesSchema)
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(eq(articlesSchema.isPublished, true))
      .orderBy(desc(articlesSchema.createdAt))
      .limit(limit);

    // Convert null values to undefined for the response
    return results.map((result) => ({
      ...result,
      categorySlug: result.categorySlug || undefined,
      departmentSlug: result.departmentSlug || undefined,
      categoryName: result.categoryName || undefined,
      departmentName: result.departmentName || undefined,
    }));
  }
  async getArticleWithAuthor(id: string): Promise<
    | (ArticleSelect & {
        authorEmail: string;
        categorySlug?: string;
        departmentSlug?: string;
        categoryName?: string;
        departmentName?: string;
      })
    | undefined
  > {
    // Import needed schemas
    const { categoriesSchema } = await import("@shared/schemas/db/categories");
    const { departmentsSchema } = await import(
      "@shared/schemas/db/departments"
    );

    const [result] = await this.db
      .select({
        id: articlesSchema.id,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        content: articlesSchema.content,
        summary: articlesSchema.summary,
        authorId: articlesSchema.authorId,
        categoryId: articlesSchema.categoryId,
        createdAt: articlesSchema.createdAt,
        updatedAt: articlesSchema.updatedAt,
        isPinned: articlesSchema.isPinned,
        isPublished: articlesSchema.isPublished,
        authorEmail: usersSchema.email,
        // Category and department fields
        categorySlug: categoriesSchema.slug,
        departmentSlug: departmentsSchema.slug,
        categoryName: categoriesSchema.name,
        departmentName: departmentsSchema.name,
      })
      .from(articlesSchema)
      .leftJoin(usersSchema, eq(articlesSchema.authorId, usersSchema.id))
      .leftJoin(
        categoriesSchema,
        eq(articlesSchema.categoryId, categoriesSchema.id),
      )
      .leftJoin(
        departmentsSchema,
        eq(categoriesSchema.departmentId, departmentsSchema.id),
      )
      .where(eq(articlesSchema.id, id));

    if (!result) return undefined;

    return {
      ...result,
      categorySlug: result.categorySlug || undefined,
      departmentSlug: result.departmentSlug || undefined,
      categoryName: result.categoryName || undefined,
      departmentName: result.departmentName || undefined,
      authorEmail: result.authorEmail || "",
    };
  }

  async getArticleStats(): Promise<{
    total: number;
    published: number;
    pinned: number;
  }> {
    const [totalResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(articlesSchema);

    const [publishedResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(articlesSchema)
      .where(eq(articlesSchema.isPublished, true));

    const [pinnedResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(articlesSchema)
      .where(
        and(
          eq(articlesSchema.isPinned, true),
          eq(articlesSchema.isPublished, true),
        ),
      );

    return {
      total: totalResult.count,
      published: publishedResult.count,
      pinned: pinnedResult.count,
    };
  }

  /**
   * Creates a URL-friendly slug from a string
   */
  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
