import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Users Dashboard",
  description:
    "Тестовое задание: таблица пользователей dummyjson с поиском, фильтрами, сортировкой и состоянием в URL.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#080b10" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Ставит data-theme до первой отрисовки: без этого тёмная тема мигает белым.
            Скрипт меняет атрибуты <html> раньше гидрации, поэтому suppressHydrationWarning
            именно на этом элементе — иначе React ругается на расхождение data-theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only rounded-lg bg-surface px-4 py-2 text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
        >
          Перейти к содержимому
        </a>

        <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-ink"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-brand text-brand-ink">
                <Users aria-hidden="true" className="size-4" />
              </span>
              Users Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
