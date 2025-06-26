import { AdminLayout } from "@/components/admin/admin-layout";
import { BreadcrumbItem, Breadcrumbs } from "@/components/admin/breadcrumbs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserAccount } from "@/hooks/use-current-user";
import { useArticleBySlug, useDeleteArticle } from "@/hooks/useArticles";
import { useDepartmentWithCategories } from "@/hooks/useStructure";
import { ADMIN_ROLES } from "@shared/constants";
import { format } from "date-fns";
import { ArrowLeftIcon, EditIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation, useParams } from "wouter";

export default function ArticleView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    department: departmentSlug,
    category: categorySlug,
    slug,
  } = useParams<{
    department?: string;
    category?: string;
    slug: string;
  }>();
  const [, navigate] = useLocation();
  const { data: article, isLoading, error } = useArticleBySlug(slug);
  const deleteArticleMutation = useDeleteArticle();
  const { data: userAccount } = useUserAccount();
  // Get department details if we have department slug
  const { data: department } = useDepartmentWithCategories(departmentSlug);

  // Find the selected category from the department data if available
  const selectedCategory = department?.categories?.find(
    (cat) => cat.slug === categorySlug,
  );
  // Check if the user has edit permissions
  const hasEditPermission =
    userAccount?.role === ADMIN_ROLES.ADMIN ||
    userAccount?.role === ADMIN_ROLES.EDITOR;
  const handleBack = () => {
    // If we have department and category info, go back to category view
    if (departmentSlug && categorySlug) {
      navigate(`/admin/articles/${departmentSlug}/${categorySlug}`);
    } else {
      // Otherwise go to articles list
      navigate("/admin/articles");
    }
  };
  const handleEdit = () => {
    navigate(`/admin/articles/edit/${article?.id || ""}`);
  };
  const openDialog = () => setIsDialogOpen(true);
  const handleDelete = async () => {
    if (!article) return;

    try {
      await deleteArticleMutation.mutateAsync(article.id); // Navigate back to category view if department and category are present
      if (departmentSlug && categorySlug) {
        navigate(`/admin/articles/${departmentSlug}/${categorySlug}`);
      } else {
        // Otherwise fallback to articles list
        navigate("/admin/articles");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    } finally {
      setIsDialogOpen(false);
    }
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
        <div className="p-6">
          <Button onClick={handleBack} className="mb-6">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>

          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-destructive">
              Article not found
            </h2>
            <p className="text-muted-foreground mt-2">
              The article you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Articles", href: "/admin/articles" },
  ];
  if (department && departmentSlug) {
    breadcrumbItems.push({
      label: department.name,
      href: `/admin/articles/${departmentSlug}`,
    });
  }

  if (department && categorySlug && selectedCategory) {
    breadcrumbItems.push({
      label: selectedCategory.name,
      href: `/admin/articles/${departmentSlug}/${categorySlug}`,
    });
  }

  // Add current article as last item
  breadcrumbItems.push({ label: article.title, isActive: true });

  return (
    <AdminLayout title={article.title} description={article.summary || ""}>
      <div>
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-6">
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                {!article.isPublished && (
                  <span className="bg-muted px-2 py-1 rounded mr-2">Draft</span>
                )}
                {article.isPinned && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded mr-2">
                    Pinned
                  </span>
                )}
                <time dateTime={new Date(article.createdAt).toISOString()}>
                  Created: {format(new Date(article.createdAt), "do MMMM yyyy")}
                </time>

                {article.updatedAt &&
                  article.updatedAt !== article.createdAt && (
                    <time
                      dateTime={new Date(article.updatedAt).toISOString()}
                      className="ml-4"
                    >
                      Updated:{" "}
                      {format(new Date(article.updatedAt), "do MMMM yyyy")}
                    </time>
                  )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {"tags" in article && article.tags && article.tags.length > 0 && (
                <>
                  {article.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-sm">
                      {tag.name}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>{" "}
          <div className="border-t mt-2 pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {/* Action buttons at the bottom */}
            {hasEditPermission && (
              <div className="mt-8 flex gap-4 justify-between">
                <Button onClick={openDialog} variant="destructive">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Article
                </Button>

                <Button onClick={handleEdit} variant="default">
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit Article
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the article{" "}
              {article?.title && <strong>"{article.title}"</strong>}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArticleMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
