import React from "react";
import { useLocation } from "wouter";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isActive?: boolean;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [, navigate] = useLocation();
  return (
    <div className="flex items-center text-sm text-muted-foreground bg-muted/30 py-2 px-2 mb-6 border-primary/20 border-b-2 rounded-lg">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && <span className="mx-3">{"/"}</span>}
          <span
            className={
              item.isActive
                ? "font-medium text-foreground"
                : item.href
                  ? "hover:text-primary cursor-pointer"
                  : ""
            }
            onClick={() => item.href && navigate(item.href)}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
