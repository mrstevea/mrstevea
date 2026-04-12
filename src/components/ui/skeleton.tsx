import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 bg-[length:400%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
