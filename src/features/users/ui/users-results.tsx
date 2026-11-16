"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { pluralizeRu } from "@/lib/format";
import type { User } from "@/types/user";
import type { UsersPage } from "../model/user-query";
import { useUsersQuery } from "../model/users-query-context";
import { ExportCsvButton } from "./export-csv-button";
import { UserDrawer } from "./user-drawer";
import { UsersCards } from "./users-cards";
import { UsersEmpty } from "./users-empty";
import { UsersPagination } from "./users-pagination";
import { UsersTable } from "./users-table";

/**
 * Клиентская оболочка результатов: приглушает устаревшие данные во время перехода,
 * держит выбранного пользователя для панели деталей.
 * Сами данные приезжают пропсами из Server Component.
 */
export function UsersResults({ page }: { page: UsersPage }) {
  const { isPending } = useUsersQuery();
  const [selected, setSelected] = useState<User | null>(null);

  return (
    <section
      aria-busy={isPending}
      className={cn(
        "transition-opacity duration-200 ease-ui",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-muted">
          Всего{" "}
          <span className="font-semibold text-ink">
            {page.total} {pluralizeRu(page.total, ["пользователь", "пользователя", "пользователей"])}
          </span>
          {isPending ? <span className="ml-2 text-xs">обновляем…</span> : null}
        </p>
        <ExportCsvButton />
      </header>

      {page.total === 0 ? (
        <UsersEmpty />
      ) : (
        <>
          <UsersTable users={page.users} onSelect={setSelected} className="hidden md:block" />
          <UsersCards users={page.users} onSelect={setSelected} className="md:hidden" />
          <UsersPagination page={page} />
        </>
      )}

      <UserDrawer user={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
