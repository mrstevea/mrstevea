import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:   "bg-forge-500 text-white shadow-sm hover:bg-forge-600 hover:shadow-recipe",
        secondary: "bg-cream-100 text-stone-800 hover:bg-cream-200",
        outline:   "border-2 border-forge-500 text-forge-600 hover:bg-forge-50",
        ghost:     "text-stone-600 hover:bg-cream-100 hover:text-stone-900",
        leaf:      "bg-leaf-500 text-white hover:bg-leaf-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        link:      "text-forge-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-3 text-xs rounded-lg",
        lg:      "h-12 px-8 text-base rounded-2xl",
        xl:      "h-14 px-10 text-lg rounded-2xl",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
