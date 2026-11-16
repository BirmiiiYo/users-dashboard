"use client";

import { FilterChip } from "@/components/ui/chip";
import { listActiveFilters, type ActiveFilter, type FilterPatch } from "../model/params";
import { useUsersQuery } from "../model/users-query-context";

const resetPatchByKey: Record<ActiveFilter["key"], FilterPatch> = {
  q: { q: "" },
  gender: { gender: "" },
  role: { role: "" },
  age: { ageMin: null, ageMax: null },
};

export function ActiveFilters() {
  const { query, update, resetFilters } = useUsersQuery();
  const filters = listActiveFilters(query);

  if (filters.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Активные фильтры">
      {filters.map((filter) => (
        <FilterChip
          key={filter.key}
          label={filter.label}
          value={filter.value}
          onRemove={() => update(resetPatchByKey[filter.key])}
        />
      ))}
      <button
        type="button"
        onClick={resetFilters}
        className="rounded text-xs text-muted underline-offset-2 transition-colors duration-150 ease-ui hover:text-ink hover:underline"
      >
        Сбросить всё
      </button>
    </div>
  );
}
