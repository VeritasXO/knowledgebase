// Extended article types that include additional metadata
import { ArticleTagSelect } from "@shared/schemas/db/article-tags";
import { ArticleSelect } from "@shared/schemas/db/articles";

export interface ArticleWithTags extends ArticleSelect {
  tags: ArticleTagSelect[];
  departmentName: string; // Required for displaying department name
  departmentSlug: string; // Required for building proper URLs
  categoryName: string; // Required for displaying category name
  categorySlug: string; // Required for building proper URLs
}

// Interface for department view with its articles
export interface DepartmentWithArticles {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articlesCount: number;
  categoriesCount: number;
}

// Interface for category view with its articles
export interface CategoryWithArticles {
  id: string;
  name: string;
  slug: string;
  departmentId: string;
  departmentName: string;
  description?: string;
  articlesCount: number;
}
