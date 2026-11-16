import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  /** Квадрат/круг для аватаров и иконок. */
  shape?: "block" | "circle";
}

export function Skeleton({ className, shape = "block" }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block animate-pulse bg-surface-hover",
        shape === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
    />
  );
}
