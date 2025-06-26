import { AdminLayout } from "@/components/admin/admin-layout";
import { ArticleForm } from "@/components/articles/article-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useArticle } from "@/hooks/useArticles";
import { useCategoryDetails, useDepartmentDetails } from "@/hooks/useStructure";
import { ArticleWithTags } from "@/types/article";
import { ArrowLeftIcon } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: article, isLoading, error } = useArticle(id);
  // Fetch category details if we have an article
  const { data: category } = useCategoryDetails(
    article?.categoryId || undefined,
  );
  // Fetch department details if we have a category
  const { data: department } = useDepartmentDetails(category?.departmentId);

  const handleCancel = () => {
    if (article && category && department) {
      // If we have the article, category, and department, navigate to the article view URL
      navigate(
        `/admin/articles/${department.slug}/${category.slug}/${article.slug}`,
      );
    } else {
      // Fallback to articles list if we can't construct the proper URL
      navigate("/admin/articles");
    }
  };

  // Handle navigation after saving the article with potentially updated category/department
  const handleSave = (updatedArticle: ArticleWithTags) => {
    // Navigate to the updated URL based on the new department and category
    navigate(
      `/admin/articles/${updatedArticle.departmentSlug}/${updatedArticle.categorySlug}/${updatedArticle.slug}`,
    );
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading Article...">
        <div className="flex items-center justify-center h-96">
          <Spinner className="h-8 w-8" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !article) {
    return (
      <AdminLayout title="Article Not Found">
        <Card>
          <CardContent>
            <div className="p-6">
              <Button onClick={handleCancel} className="mb-6">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>

              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-destructive">
                  Article not found
                </h2>
                <p className="text-muted-foreground mt-2">
                  The article you're trying to edit doesn't exist or you don't
                  have permission to edit it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title="Articles" description="View and manage articles.">
      <ArticleForm
        article={article}
        onCancel={handleCancel}
        initialCategoryId={article.categoryId || ""}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
