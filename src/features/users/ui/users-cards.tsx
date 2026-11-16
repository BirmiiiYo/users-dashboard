"use client";

import { ChevronRight } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/cn";
import { formatAge, formatGender, fullName } from "@/lib/format";
import type { User } from "@/types/user";
import { RoleBadge, StatusBadge } from "./user-badges";
import { UserAvatar } from "./user-avatar";

interface UsersCardsProps {
  users: readonly User[];
  onSelect: (user: User) => void;
  className?: string;
}

/**
 * Мобильное представление тех же данных: строка таблицы → карточка.
 *
 * Карточка не может быть `<button>`: внутри неё живёт кнопка «скопировать email»,
 * а вложенные кнопки — невалидный HTML и ошибка гидрации. Поэтому карточка —
 * контейнер, а на всю её площадь растянута отдельная кнопка (клавиатура работает,
 * клик по контенту открывает панель, у кнопки копирования свой слой).
 */
export function UsersCards({ users, onSelect, className }: UsersCardsProps) {
  return (
    <ul className={cn("space-y-2", className)}>
      {users.map((user) => (
        <li
          key={user.id}
          className={cn(
            "relative rounded-panel border border-line bg-surface shadow-sm",
            "transition-colors duration-150 ease-ui hover:bg-surface-hover/70",
            "focus-within:ring-2 focus-within:ring-brand/70",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(user)}
            className="absolute inset-0 z-0 w-full rounded-panel"
          >
            <span className="sr-only">Открыть карточку {fullName(user)}</span>
          </button>

          <div className="pointer-events-none relative z-10 flex items-start gap-3 p-3">
            <UserAvatar user={user} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{fullName(user)}</p>
                  <p className="truncate text-xs text-muted">@{user.username}</p>
                </div>
                <StatusBadge user={user} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <RoleBadge role={user.role} />
                <span>
                  {formatAge(user.age)} · {formatGender(user.gender)}
                </span>
              </div>

              <p className="mt-2 truncate text-xs text-muted">
                {user.company.name} · {user.company.title}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="truncate text-muted">{user.email}</span>
                <span className="pointer-events-auto">
                  <CopyButton value={user.email} label={`email ${fullName(user)}`} />
                </span>
              </div>
            </div>
            <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}
