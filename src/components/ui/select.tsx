import { ChevronDown } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SelectProps = ComponentPropsWithoutRef<"select"> & {
  children: ReactNode;
};

/** Нативный <select> (лучшая доступность и мобильные пикеры), стилизованный под дизайн-систему. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-line bg-surface py-0 pr-9 pl-3 text-sm text-ink",
          "transition-colors duration-150 ease-ui hover:border-line-strong focus:border-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
});
