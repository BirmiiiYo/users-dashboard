"use client";

import { RotateCcw, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { hasActiveFilters } from "../model/params";
import { useUsersQuery } from "../model/users-query-context";
import { ActiveFilters } from "./active-filters";
import { UsersFilters } from "./users-filters";

const SEARCH_DEBOUNCE_MS = 350;

export function UsersToolbar() {
  const { query, update, resetFilters } = useUsersQuery();
  const searchId = useId();
  const [search, setSearch] = useState(query.q);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  // URL — источник правды: чип, сброс или кнопка «назад» обновляют и поле ввода.
  useEffect(() => {
    setSearch(query.q);
  }, [query.q]);

  useEffect(() => {
    if (debouncedSearch === query.q) return;
    update({ q: debouncedSearch });
  }, [debouncedSearch, query.q, update]);

  return (
    <section
      aria-label="Поиск и фильтры"
      className="mb-4 rounded-panel border border-line bg-surface p-4 shadow-sm"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="min-w-0 flex-1 lg:max-w-md"
        >
          <Field label="Поиск по имени, email или username" htmlFor={searchId}>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              />
              <Input
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Например, Emily"
                autoComplete="off"
                spellCheck={false}
                className="pl-9 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
          </Field>
        </form>

        <UsersFilters />

        <div className="flex items-center gap-2 xl:ml-auto">
          <Button
            variant="secondary"
            onClick={resetFilters}
            disabled={!hasActiveFilters(query)}
            title="Сбросить поиск и фильтры"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Сбросить
          </Button>
        </div>
      </div>

      <ActiveFilters />
    </section>
  );
}
