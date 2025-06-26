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
import { useDepartments } from "@/hooks/useStructure";
import { ArticleWithTags } from "@/types/article";
import { Department } from "@shared/schemas/validation/departments";
import { FolderIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function DepartmentsView() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: departments, isLoading: isLoadingDepartments } =
    useDepartments();
  const { data: articleResults, isLoading: isLoadingArticles } = useArticles({
    query: searchQuery,
  });

  // Handle viewing a department
  const handleViewDepartment = (department: Department) => {
    navigate(`/admin/articles/${department.slug}`);
  };
  // Handle viewing an article
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
  // Build breadcrumb items for departments page
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Articles", href: "/admin/articles", isActive: true },
  ];

  return (
    <AdminLayout
      title="Articles"
      description="Browse all articles sorted by departments and its categories within our knowledge base."
    >
      <div className="space-y-6">
        {/* Add breadcrumbs to match categories.tsx layout */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Match search bar spacing with categories.tsx */}
        <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-none mt-4 mb-6">
          <ArticleSearch onSearch={handleSearch} />
        </div>
        {isSearching ? (
          <div>
            {isLoadingArticles ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-muted rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articleResults?.articles &&
                articleResults.articles.length > 0 ? (
                  articleResults.articles.map((article) => (
                    <div key={article.id} className="relative">
                      <ArticleCard
                        article={article}
                        onView={handleViewArticle}
                      />{" "}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {article.departmentName || "No department"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {article.categoryName || "No category"}
                        </Badge>
                      </div>
                    </div>
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
          <div>
            {isLoadingDepartments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-muted rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments && departments.length > 0 ? (
                  departments.map((department) => (
                    <Card
                      key={department.id}
                      className="cursor-pointer group relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 p-0 border-2 hover:border-primary/50"
                      onClick={() => handleViewDepartment(department)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="">
                        <div className="flex items-center space-x-3 mb-2">
                          {department.image ? (
                            <div className="h-12 w-12 flex items-center justify-center p-2">
                              <img
                                src={department.image}
                                alt={department.name}
                                className="max-h-10 max-w-10 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm">
                              <FolderIcon className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <CardTitle className="text-xl font-semibold">
                            {department.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2 text-sm pb-1">
                          {department.description || "No description available"}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-4 pb-4 px-4 flex justify-between items-center border-t bg-muted/30">
                        <span className="text-xs font-medium text-muted-foreground">
                          View categories
                        </span>
                        <Badge
                          variant="green"
                          className="px-2.5 py-1 shadow-sm"
                        >
                          {department.articleCount || 0}{" "}
                          {department.articleCount === 1
                            ? "Article"
                            : "Articles"}
                        </Badge>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-medium text-muted-foreground">
                      No departments found
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Departments need to be created in the Settings area
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
