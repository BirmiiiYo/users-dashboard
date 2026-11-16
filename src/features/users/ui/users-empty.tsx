"use client";

import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasActiveFilters } from "../model/params";
import { useUsersQuery } from "../model/users-query-context";

/** Пустое состояние: объясняем, что именно сузило выборку, и даём выход одним кликом. */
export function UsersEmpty() {
  const { query, resetFilters } = useUsersQuery();
  const filtersActive = hasActiveFilters(query);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-surface-hover text-muted">
        <SearchX aria-hidden="true" className="size-5" />
      </span>
      <div>
        <p className="font-medium text-ink">Ничего не найдено</p>
        <p className="mt-1 max-w-md text-sm text-muted">
          {query.q
            ? `По запросу «${query.q}» и выбранным фильтрам пользователей нет.`
            : "Под выбранные фильтры не подходит ни один пользователь."}
        </p>
      </div>
      {filtersActive ? (
        <Button variant="primary" size="sm" onClick={resetFilters}>
          Сбросить фильтры
        </Button>
      ) : null}
    </div>
  );
}
