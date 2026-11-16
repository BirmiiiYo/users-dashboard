"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Граница ошибок для сегмента: сеть упала — показываем причину и retry.
 * `reset` перерисовывает сегмент, `router.refresh` заставляет заново сходить в API.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        role="alert"
        className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-panel border border-line bg-surface p-8 text-center shadow-sm"
      >
        <h1 className="text-lg font-semibold text-ink">Не удалось загрузить пользователей</h1>
        <p className="text-sm text-muted">
          {error.message || "Сервис временно недоступен. Попробуйте ещё раз."}
        </p>
        <Button
          variant="primary"
          onClick={() => {
            reset();
            router.refresh();
          }}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Повторить
        </Button>
      </div>
    </main>
  );
}
