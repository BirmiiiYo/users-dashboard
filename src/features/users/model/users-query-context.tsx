"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import {
  DEFAULT_USERS_QUERY,
  applyQueryPatch,
  parseUsersQuery,
  toSearchParams,
  type FilterPatch,
  type UsersQuery,
} from "./params";

interface UsersQueryContextValue {
  /** Текущее состояние из URL (после коммита навигации). */
  query: UsersQuery;
  /** Идёт переход: показываем старые данные приглушёнными. */
  isPending: boolean;
  update: (patch: FilterPatch) => void;
  resetFilters: () => void;
}

const UsersQueryContext = createContext<UsersQueryContextValue | null>(null);

/**
 * Всё состояние экрана живёт в URL, локального стора нет.
 * Навигация обёрнута в startTransition: React держит предыдущий UI,
 * пока RSC-дерево не приедет, поэтому таблица не «дёргается».
 */
export function UsersQueryProvider({
  initialQuery,
  children,
}: {
  initialQuery: UsersQuery;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchKey = searchParams.toString();
  const query = useMemo(
    () => parseUsersQuery(Object.fromEntries(new URLSearchParams(searchKey))),
    [searchKey],
  );

  // Последнее намерение пользователя: два быстрых изменения не должны затирать друг друга.
  const latestQuery = useRef<UsersQuery>(initialQuery);
  useEffect(() => {
    latestQuery.current = query;
  }, [query]);

  const navigate = useCallback(
    (next: UsersQuery) => {
      latestQuery.current = next;
      const search = toSearchParams(next).toString();
      startTransition(() => {
        router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  const update = useCallback(
    (patch: FilterPatch) => {
      navigate(applyQueryPatch(latestQuery.current, patch));
    },
    [navigate],
  );

  const resetFilters = useCallback(() => {
    const current = latestQuery.current;
    navigate({
      ...DEFAULT_USERS_QUERY,
      sortBy: current.sortBy,
      order: current.order,
      limit: current.limit,
    });
  }, [navigate]);

  const value = useMemo<UsersQueryContextValue>(
    () => ({ query, isPending, update, resetFilters }),
    [query, isPending, update, resetFilters],
  );

  return <UsersQueryContext.Provider value={value}>{children}</UsersQueryContext.Provider>;
}

export function useUsersQuery(): UsersQueryContextValue {
  const value = useContext(UsersQueryContext);
  if (!value) {
    throw new Error("useUsersQuery должен вызываться внутри UsersQueryProvider");
  }
  return value;
}
