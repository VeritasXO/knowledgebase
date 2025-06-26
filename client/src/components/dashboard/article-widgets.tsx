import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ArticleSelect } from "@shared/schemas/db/articles";
import { formatDistanceToNow } from "date-fns";
import { BookIcon, ClockIcon, EyeIcon, PinIcon } from "lucide-react";
import { useLocation } from "wouter";

interface ArticleStatsProps {
  stats?: {
    total: number;
    published: number;
    pinned: number;
  };
  isLoading: boolean;
  className?: string;
}

export function ArticleStats({
  stats,
  isLoading,
  className,
}: ArticleStatsProps) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookIcon className="h-4 w-4" />
          Article Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-16 flex items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-2 rounded-md bg-background">
              <span className="text-2xl font-bold">{stats.total}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md bg-background">
              <span className="text-2xl font-bold">{stats.published}</span>
              <span className="text-xs text-muted-foreground">Published</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md bg-background">
              <span className="text-2xl font-bold">{stats.pinned}</span>
              <span className="text-xs text-muted-foreground">Pinned</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentArticlesProps {
  articles?: ArticleSelect[];
  isLoading: boolean;
  className?: string;
}

export function RecentArticles({
  articles,
  isLoading,
  className,
}: RecentArticlesProps) {
  const [, navigate] = useLocation();

  const handleViewArticle = (article: ArticleSelect) => {
    navigate(`/admin/articles/${article.slug}`);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Recently Created
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-36 flex items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="divide-y max-h-[380px] overflow-y-auto">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-start justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <BookIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium leading-tight truncate max-w-xs">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <time
                        className="text-xs inline-flex items-center text-muted-foreground"
                        dateTime={new Date(article.createdAt).toISOString()}
                      >
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(article.createdAt), {
                          addSuffix: true,
                        })}
                      </time>
                      {!article.isPublished ? (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded inline-flex items-center">
                          Draft
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded inline-flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewArticle(article)}
                  className="ml-2 shrink-0"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No articles created yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PinnedArticlesProps {
  articles?: ArticleSelect[];
  isLoading: boolean;
  className?: string;
}

export function PinnedArticles({
  articles,
  isLoading,
  className,
}: PinnedArticlesProps) {
  const [, navigate] = useLocation();

  const handleViewArticle = (article: ArticleSelect) => {
    navigate(`/admin/articles/${article.slug}`);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PinIcon className="h-5 w-5" />
          Pinned Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-36 flex items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="divide-y max-h-[380px] overflow-y-auto">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-start justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="rounded-md bg-amber-100 dark:bg-amber-900/30 p-2 text-amber-800 dark:text-amber-300">
                    <PinIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium leading-tight truncate max-w-xs">
                      {article.title}
                    </h4>
                    <div className="flex items-center mt-1">
                      <time
                        className="text-xs inline-flex items-center text-muted-foreground"
                        dateTime={new Date(article.createdAt).toISOString()}
                      >
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(article.createdAt), {
                          addSuffix: true,
                        })}
                      </time>
                      {!article.isPublished && (
                        <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                      {article.isPublished && (
                        <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded inline-flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewArticle(article)}
                  className="ml-2 shrink-0"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No pinned articles yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
