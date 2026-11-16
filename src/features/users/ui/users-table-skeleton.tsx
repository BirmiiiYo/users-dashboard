import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton повторяет геометрию таблицы, поэтому при подмене контента
 * страница не «прыгает» (нет layout shift).
 */
export function UsersTableSkeleton({ limit }: { limit: number }) {
  const rows = Math.min(limit, 8);

  return (
    <div aria-hidden="true" className="rounded-panel border border-line bg-surface shadow-sm">
      <div className="hidden border-b border-line bg-surface-muted px-4 py-3 md:block">
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="divide-y divide-line">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton shape="circle" className="size-10" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="hidden h-3 w-48 md:block" />
            <Skeleton className="hidden h-5 w-20 rounded-full md:block" />
            <Skeleton className="hidden h-3 w-24 md:block" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      <span className="sr-only">Загружаем пользователей…</span>
    </div>
  );
}
