import { AdminLayout } from "@/components/admin/admin-layout";
import { BreadcrumbItem, Breadcrumbs } from "@/components/admin/breadcrumbs";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleSearch } from "@/components/articles/article-search";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useArticles } from "@/hooks/useArticles";
import { useDepartmentWithCategories } from "@/hooks/useStructure";
import { ArticleWithTags } from "@/types/article";
import { Category } from "@shared/schemas/validation/departments";
import { LayersIcon } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

export default function CategoriesView() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Get department details
  const { data: department, isLoading: isDepartmentLoading } =
    useDepartmentWithCategories(slug);

  // Get department articles when searching
  const { data: articleResults, isLoading: isArticlesLoading } = useArticles({
    query: searchQuery,
    ...(slug && { departmentSlug: slug }),
  });

  const handleViewCategory = (category: Category) => {
    navigate(`/admin/articles/${slug}/${category.slug}`);
  };

  const handleViewArticle = (article: ArticleWithTags) => {
    navigate(
      `/admin/articles/${article.departmentSlug}/${article.categorySlug}/${article.slug}`,
    );
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const isSearching = searchQuery.trim().length > 0;

  if (!slug) {
    return <div>Department slug is required</div>;
  }

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Articles", href: "/admin/articles" },
    { label: department?.name || "...", isActive: true },
  ];

  return (
    <AdminLayout
      title={department?.name || "Department"}
      description={department?.description || "Loading department details..."}
    >
      <div>
        <Breadcrumbs items={breadcrumbItems} />

        {/* Add search bar */}
        <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-none mt-4 mb-6">
          <ArticleSearch onSearch={handleSearch} />
        </div>

        {isSearching ? (
          // Show search results
          <div>
            {isArticlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-muted rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {articleResults?.articles &&
                articleResults.articles.length > 0 ? (
                  articleResults.articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onView={handleViewArticle}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-medium text-muted-foreground">
                      No articles found
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Try adjusting your search query
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Show categories in the department (original view)
          <div>
            {isDepartmentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-muted rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : (
              // Show categories in the department
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {department?.categories && department.categories.length > 0 ? (
                  department.categories.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer group relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 p-0 border-2 hover:border-primary/50"
                      onClick={() => handleViewCategory(category)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-12 w-12 flex items-center justify-center">
                            <LayersIcon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle className="text-xl font-semibold">
                            {category.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2 text-sm pb-1">
                          {category.description || "No description available"}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-4 pb-4 px-4 flex justify-between items-center border-t bg-muted/30">
                        <span className="text-xs font-medium text-muted-foreground">
                          View articles
                        </span>
                        <Badge
                          variant="green"
                          className="px-2.5 py-1 shadow-sm"
                        >
                          {category.articleCount || 0}{" "}
                          {category.articleCount === 1 ? "Article" : "Articles"}
                        </Badge>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-medium text-muted-foreground">
                      No categories found
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Categories need to be created in the Settings area
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
