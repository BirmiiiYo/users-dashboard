"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { cn } from "@/lib/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

/**
 * Модальная панель справа. Доступность: role="dialog" + aria-modal,
 * фокус-трап, Esc, клик по оверлею, возврат фокуса на триггер.
 */
export function Drawer({ open, onClose, title, description, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(panelRef, { active: open, onEscape: onClose });
  useScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-overlay"
        onClick={onClose}
        aria-hidden="true"
        data-testid="drawer-overlay"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-panel",
          "animate-[slide-in-right_200ms_cubic-bezier(0.2,0.8,0.2,1)]",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 truncate text-xs text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть панель"
            className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-150 ease-ui hover:bg-surface-hover hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div className="scrollbar-slim flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
