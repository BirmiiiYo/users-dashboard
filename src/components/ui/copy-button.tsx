"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  value: string;
  /** Что копируем — попадает в aria-label и в озвучку результата. */
  label: string;
  className?: string;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // падаем в fallback ниже
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    // Кнопка живёт внутри кликабельной строки — не открываем карточку.
    event.stopPropagation();
    const ok = await copyToClipboard(value);
    setStatus(ok ? "copied" : "failed");

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Скопировать ${label}`}
        title={`Скопировать ${label}`}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-ui",
          "hover:bg-surface-hover hover:text-ink",
          className,
        )}
      >
        {status === "copied" ? (
          <Check aria-hidden="true" className="size-3.5 text-success" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? `${label} скопирован` : null}
        {status === "failed" ? `Не удалось скопировать ${label}` : null}
      </span>
    </>
  );
}
