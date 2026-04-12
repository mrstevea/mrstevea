import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-forge-100 text-forge-700",
        leaf:     "bg-leaf-100 text-leaf-700",
        outline:  "border border-stone-200 text-stone-600",
        critical: "bg-red-100 text-red-700",
        high:     "bg-orange-100 text-orange-700",
        medium:   "bg-yellow-100 text-yellow-700",
        low:      "bg-green-100 text-green-700",
        skill:    "bg-indigo-100 text-indigo-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
