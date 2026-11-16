import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TableProps extends ComponentPropsWithoutRef<"table"> {
  caption?: ReactNode;
}

export function Table({ className, children, caption, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full min-w-[880px] border-collapse text-left text-sm", className)}
        {...props}
      >
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line bg-surface-muted text-xs text-muted uppercase">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

interface ThProps extends ComponentPropsWithoutRef<"th"> {
  /** aria-sort обязателен для сортируемых колонок: screen reader должен знать направление. */
  sort?: "ascending" | "descending" | "none";
}

export function Th({ className, children, sort, ...props }: ThProps) {
  return (
    <th
      scope="col"
      aria-sort={sort}
      className={cn("px-4 py-3 font-semibold tracking-wide whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: ComponentPropsWithoutRef<"td">) {
  return (
    <td className={cn("px-4 py-3 align-middle", className)} {...props}>
      {children}
    </td>
  );
}
