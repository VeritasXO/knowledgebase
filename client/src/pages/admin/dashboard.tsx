import { AdminLayout } from "@/components/admin/admin-layout";
import {
  PinnedArticles,
  RecentArticles,
} from "@/components/dashboard/article-widgets";
import { Button } from "@/components/ui/button";
import { useUserAccount } from "@/hooks/use-current-user";
import { usePinnedArticles, useRecentArticles } from "@/hooks/useArticles";
import { ADMIN_ROLES } from "@shared/constants";
import { PlusIcon, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { data: userAccount } = useUserAccount();
  const isAdmin = userAccount?.role === ADMIN_ROLES.ADMIN;

  // Fetch article data
  const { data: recentArticles, isLoading: recentLoading } =
    useRecentArticles(6); // Increased count for better display
  const { data: pinnedArticles, isLoading: pinnedLoading } =
    usePinnedArticles(6); // Increased count for better display

  const [, navigate] = useLocation();

  return (
    <AdminLayout title="Dashboard" description="Overview of system status.">
      <div className="space-y-6">
        {/* Welcome header with quick actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-muted/20 p-6 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to Knowledge Base
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your articles and knowledge content in one place
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Button onClick={() => navigate("/admin/articles/create")}>
                <PlusIcon className="h-4 w-4 mr-2" /> New Article
              </Button>
            )}

            <Button onClick={() => navigate("/admin/articles")}>
              <Search className="h-4 w-4" /> Browse Articles
            </Button>
          </div>
        </div>

        {/* Main content area - featured sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pinned articles - prominently displayed */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 pl-3 border-l-4 border-amber-500/70 py-1">
              Featured Articles
            </h2>
            <PinnedArticles
              articles={pinnedArticles}
              isLoading={pinnedLoading}
              className="shadow-md"
            />
          </div>

          {/* Recent articles - prominently displayed */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 pl-3 border-l-4 border-primary/70 py-1">
              Recently Added
            </h2>
            <RecentArticles
              articles={recentArticles}
              isLoading={recentLoading}
              className="shadow-md"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
