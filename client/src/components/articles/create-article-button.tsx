import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useLocation } from "wouter";

interface CreateArticleButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CreateArticleButton({
  variant = "default",
  size = "default",
}: CreateArticleButtonProps) {
  const [, navigate] = useLocation();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => navigate("/admin/articles/create")}
    >
      <PlusIcon className="h-4 w-4 mr-2" />
      New Article
    </Button>
  );
}
