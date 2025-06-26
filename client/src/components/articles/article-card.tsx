import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArticleWithTags } from "@/types/article";
import { formatDistanceToNow } from "date-fns";
import { BookIcon, PinIcon } from "lucide-react";

interface ArticleCardProps {
  article: ArticleWithTags;
  onView?: (article: ArticleWithTags) => void;
  className?: string;
}

export function ArticleCard({ article, onView, className }: ArticleCardProps) {
  const handleCardClick = () => {
    if (onView) {
      onView(article);
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-primary transition-colors",
        className,
      )}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BookIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg flex items-center gap-2">
            {article.title}
            {article.isPinned && <PinIcon className="h-4 w-4 text-amber-500" />}
            {!article.isPublished && (
              <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground ml-2">
                Draft
              </span>
            )}
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          {article.summary || "No description available"}
        </CardDescription>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardFooter className="pt-2 text-sm text-muted-foreground">
        <div className="text-xs">
          Created{" "}
          {formatDistanceToNow(new Date(article.createdAt), {
            addSuffix: true,
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
