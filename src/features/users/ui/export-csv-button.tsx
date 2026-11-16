"use client";

import { Download } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { toSearchParams } from "../model/params";
import { useUsersQuery } from "../model/users-query-context";

/**
 * Экспорт всей текущей выборки (а не только страницы): ссылка ведёт в route handler,
 * который отдаёт CSV с Content-Disposition. Blob URL не создаём — нечему утекать.
 */
export function ExportCsvButton() {
  const { query } = useUsersQuery();
  const search = toSearchParams(query).toString();
  const href = search ? `/api/users/export?${search}` : "/api/users/export";

  return (
    <a
      href={href}
      className={buttonStyles({ variant: "secondary", size: "sm" })}
      title="Скачать CSV со всеми записями, подходящими под текущие фильтры"
    >
      <Download aria-hidden="true" className="size-3.5" />
      Экспорт CSV
    </a>
  );
}
