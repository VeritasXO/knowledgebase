import { AdminLayout } from "@/components/admin/admin-layout";
import { ArticleForm } from "@/components/articles/article-form";
import { useCategoryDetails, useDepartmentDetails } from "@/hooks/useStructure";
import { ArticleWithTags } from "@/types/article";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ArticleCreate() {
  const [, navigate] = useLocation();
  const [categoryId, setCategoryId] = useState<string>(""); // Get categoryId from URL query parameter if present
  // Use location from wouter to detect URL changes
  const [location] = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const categoryIdParam = searchParams.get("categoryId");
    if (categoryIdParam) {
      setCategoryId(categoryIdParam);
    }
  }, [location]);
  // Fetch category details to get department and category slugs
  const { data: categoryDetails } = useCategoryDetails(categoryId || undefined);
  const { data: departmentDetails } = useDepartmentDetails(
    categoryDetails?.departmentId,
  );
  const handleCancel = () => {
    navigate("/admin/articles");
  };
  const handleSave = async (article: ArticleWithTags) => {
    // Get the department slug and category slug to construct the proper URL
    if (categoryDetails && departmentDetails) {
      // Navigate to the newly created article using the proper URL structure
      navigate(
        `/admin/articles/${departmentDetails.slug}/${categoryDetails.slug}/${article.slug}`,
      );
    } else {
      // Fallback if we can't get category details
      navigate(`/admin/articles`);
    }
  };

  return (
    <AdminLayout title="Articles" description="View and manage articles.">
      <ArticleForm
        onCancel={handleCancel}
        initialCategoryId={categoryId}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
