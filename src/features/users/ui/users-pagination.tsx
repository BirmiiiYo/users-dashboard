"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { pluralizeRu } from "@/lib/format";
import { PAGE_SIZES, type PageSize } from "../model/params";
import type { UsersPage } from "../model/user-query";
import { useUsersQuery } from "../model/users-query-context";

/** Окно страниц: 1 … current-1 current current+1 … last */
export function buildPageWindow(current: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= totalPages - 2) {
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));
  }

  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) result.push("gap");
    result.push(page);
  });

  return result;
}

export function UsersPagination({ page }: { page: UsersPage }) {
  const { query, update } = useUsersQuery();
  const pages = buildPageWindow(page.page, page.totalPages);
  const isFirst = page.page <= 1;
  const isLast = page.page >= page.totalPages;

  return (
    <nav
      aria-label="Пагинация"
      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted">
        Показано {page.rangeStart}–{page.rangeEnd} из {page.total}{" "}
        {pluralizeRu(page.total, ["пользователя", "пользователя", "пользователей"])}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="page-size" className="text-xs text-muted">
          На странице
        </label>
        <Select
          id="page-size"
          value={query.limit}
          onChange={(event) => update({ limit: Number(event.target.value) as PageSize })}
          className="h-8 w-[76px] text-xs"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Предыдущая страница"
            disabled={isFirst}
            onClick={() => update({ page: page.page - 1 })}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>

          <ul className="flex items-center gap-1">
            {pages.map((item, index) =>
              item === "gap" ? (
                <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-xs text-muted">
                  …
                </li>
              ) : (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => update({ page: item })}
                    aria-label={`Страница ${item}`}
                    aria-current={item === page.page ? "page" : undefined}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-colors duration-150 ease-ui",
                      item === page.page
                        ? "bg-brand text-brand-ink"
                        : "border border-line bg-surface text-ink hover:bg-surface-hover",
                    )}
                  >
                    {item}
                  </button>
                </li>
              ),
            )}
          </ul>

          <Button
            size="icon"
            variant="secondary"
            aria-label="Следующая страница"
            disabled={isLast}
            onClick={() => update({ page: page.page + 1 })}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
