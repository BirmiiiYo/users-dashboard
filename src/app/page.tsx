import { Suspense } from "react";
import { getUsersPage } from "@/features/users/api/users-api";
import { parseUsersQuery, type RawSearchParams, type UsersQuery } from "@/features/users/model/params";
import { UsersQueryProvider } from "@/features/users/model/users-query-context";
import { UsersResults } from "@/features/users/ui/users-results";
import { UsersTableSkeleton } from "@/features/users/ui/users-table-skeleton";
import { UsersToolbar } from "@/features/users/ui/users-toolbar";

interface DashboardPageProps {
  searchParams: Promise<RawSearchParams>;
}

/**
 * Server Component читает searchParams и отдаёт готовую страницу данных.
 * Тулбар — клиентский и живёт вне Suspense: при навигации поле поиска
 * не размонтируется и не теряет фокус.
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const query = parseUsersQuery(await searchParams);

  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-xl font-semibold text-ink sm:text-2xl">Пользователи</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Данные dummyjson.com. Поиск, фильтры, сортировка и пагинация хранятся в URL — ссылку
          можно скопировать и открыть в новой вкладке с тем же состоянием.
        </p>
      </div>

      <UsersQueryProvider initialQuery={query}>
        <UsersToolbar />
        <Suspense fallback={<UsersTableSkeleton limit={query.limit} />}>
          <UsersData query={query} />
        </Suspense>
      </UsersQueryProvider>
    </main>
  );
}

async function UsersData({ query }: { query: UsersQuery }) {
  const page = await getUsersPage(query);
  return <UsersResults page={page} />;
}
