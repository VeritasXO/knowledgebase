import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "rounded-full border text-center min-w-[100px] min-h-[28px] flex justify-center items-center px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        green:
          "dark:bg-green-950 dark:text-green-300 dark:border-green-800 bg-green-100 text-green-800 border-green-300",
        red: "dark:bg-red-950 dark:text-red-300 dark:border-red-800 bg-red-100 text-red-800 border-red-300",
        blue: "dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 bg-blue-100 text-blue-800 border-blue-300",
        gray: "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 border-gray-300",

        "move-in":
          "dark:bg-sky-800 dark:text-sky-300 dark:border-sky-600 bg-sky-100 text-sky-800 border-sky-300",
        "move-out":
          "dark:bg-indigo-800 dark:text-indigo-300 dark:border-indigo-600 bg-indigo-100 text-indigo-800 border-indigo-300",
        delivery:
          "dark:bg-purple-800 dark:text-purple-300 dark:border-purple-600 bg-purple-100 text-purple-800 border-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
