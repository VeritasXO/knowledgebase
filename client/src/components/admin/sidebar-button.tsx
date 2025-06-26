import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SidebarButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarButtonProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start px-3.5 rounded-md backdrop-blur-md transition-all duration-300 group shadow-[1px_1px_2px_rgba(0,0,0,0.4)]
        border border-l-2 border-primary/40
        bg-gradient-to-r from-primary/15 to-primary/5 dark:from-primary/15 dark:to-primary/5
        ${
          isActive
            ? "border-primary/80 bg-gradient-to-r from-primary/40 to-primary/10 dark:from-primary/40 dark:to-primary/10"
            : ""
        }`}
      onClick={onClick}
    >
      <Icon
        className={`${
          isActive
            ? "mr-1.5 h-4 w-4 text-primary"
            : "mr-1.5 h-3.5 w-3.5 opacity-80"
        }`}
      />{" "}
      <span
        className={`transition-transform duration-300 ${
          isActive ? "translate-x-1" : ""
        } group-hover:translate-x-1`}
      >
        {label}
      </span>
    </Button>
  );
}
