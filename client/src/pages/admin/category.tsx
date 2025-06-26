import { AdminLayout } from "@/components/admin/admin-layout";
import { BreadcrumbItem, Breadcrumbs } from "@/components/admin/breadcrumbs";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleSearch } from "@/components/articles/article-search";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";
import { useDepartmentWithCategories } from "@/hooks/useStructure";
import { ArticleWithTags } from "@/types/article";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

export default function CategoryView() {
  const { department: departmentSlug, category: categorySlug } = useParams();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Get department details to find category info
  const { data: department, isLoading: isDepartmentLoading } =
    useDepartmentWithCategories(departmentSlug);

  // Find the selected category from the department data
  const selectedCategory = department?.categories?.find(
    (cat) => cat.slug === categorySlug,
  );

  // Get all articles (filtered by search query if present)
  const { data, isLoading: isArticlesLoading } = useArticles({
    query: searchQuery,
    ...(selectedCategory?.id && { categoryId: selectedCategory.id }),
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter articles for selected category (only needed when not searching)
  const articles: ArticleWithTags[] =
    selectedCategory && !searchQuery
      ? (data?.articles || []).filter(
          (article) => article.categoryId === selectedCategory.id,
        )
      : data?.articles || [];

  const isLoading = isDepartmentLoading || isArticlesLoading;
  const isSearching = searchQuery.trim().length > 0;

  const handleView = (article: ArticleWithTags) => {
    navigate(
      `/admin/articles/${departmentSlug}/${categorySlug}/${article.slug}`,
    );
  };

  const handleCreateArticle = () => {
    if (selectedCategory) {
      navigate(`/admin/articles/create?categoryId=${selectedCategory.id}`);
    }
  };

  if (!departmentSlug || !categorySlug) {
    return <div>Department and category slugs are required</div>;
  }
  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Articles", href: "/admin/articles" },
    {
      label: department?.name || "...",
      href: `/admin/articles/${departmentSlug}`,
    },
    { label: selectedCategory?.name || "...", isActive: true },
  ];

  return (
    <AdminLayout
      title={selectedCategory?.name || "Category"}
      description={
        selectedCategory?.description || "Loading category details..."
      }
    >
      <div>
        {/* Use the new Breadcrumbs component */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Add search bar */}
        <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-none mt-4 mb-6">
          <ArticleSearch onSearch={handleSearch} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          // Show articles for the selected category
          <div className="grid grid-cols-1 gap-4 mt-6">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onView={handleView}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-muted-foreground">
                  {isSearching
                    ? "No articles found matching your search"
                    : "No articles found"}
                </h3>
                {!isSearching && (
                  <Button
                    onClick={handleCreateArticle}
                    className="mt-4"
                    variant="default"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                )}
                {isSearching && (
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search query
                  </p>
                )}
              </div>
            )}

            {/* Add Create Article button at the bottom when articles are present and not searching */}
            {articles.length > 0 && !isSearching && (
              <div className="col-span-full flex justify-center mt-8 mb-4">
                <Button onClick={handleCreateArticle}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
