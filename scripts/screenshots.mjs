/* eslint-disable no-console -- скрипт запускается вручную и печатает результат проверки темы */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Скриншоты для README: `node scripts/screenshots.mjs` при запущенном сервере.
 * BASE_URL по умолчанию http://127.0.0.1:3000 (pnpm start / pnpm dev).
 */
const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const OUT_DIR = "docs/screenshots";

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

async function newPage({ width, height, dark = false, mobile = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: dark ? "dark" : "light",
    isMobile: mobile,
    hasTouch: mobile,
    locale: "ru-RU",
  });
  const page = await context.newPage();
  return { context, page };
}

/** Ждём данные и гасим анимации, чтобы кадр был стабильным. */
async function settle(page) {
  // на мобиле таблица скрыта CSS-ом, поэтому ждём «данные пришли» по DOM, а не по видимости строки
  await page.waitForFunction(
    () => Boolean(document.querySelector("tbody tr")) || document.body.innerText.includes("Ничего не найдено"),
    null,
    { timeout: 30_000 },
  );
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content: "*, *::before, *::after { transition: none !important; animation: none !important; }",
  });
  await page.waitForTimeout(250);
}

// 1. Основной экран, светлая тема
{
  const { context, page } = await newPage({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/`);
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/01-dashboard-light.png` });

  // 2. Карточка пользователя (drawer) поверх таблицы
  await page.locator("tbody tr").first().getByRole("button").first().click();
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT_DIR}/02-user-drawer.png` });

  await context.close();
}

// 3. Поиск + фильтры + сортировка (состояние из URL)
{
  const { context, page } = await newPage({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/?q=an&gender=female&ageMin=25&ageMax=45&sortBy=age&order=desc`);
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/03-filters.png` });
  await context.close();
}

// 4. Тёмная тема — переключаем кнопкой и проверяем, что выбор пережил перезагрузку
{
  const { context, page } = await newPage({ width: 1440, height: 1000, dark: true });
  await page.goto(`${BASE_URL}/`);
  await settle(page);
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.screenshot({ path: `${OUT_DIR}/04-dashboard-dark.png` });

  await page.getByRole("button", { name: /Тема:/ }).click();
  await page.reload();
  await settle(page);
  const after = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    mode: document.documentElement.dataset.themeMode,
    stored: localStorage.getItem("users-dashboard-theme"),
  }));

  console.log("theme on first load:", before);
  console.log("theme after toggle + reload:", after);

  await context.close();
}

// 5. Мобильный вид: карточки вместо таблицы
{
  const { context, page } = await newPage({ width: 390, height: 844, mobile: true });
  await page.goto(`${BASE_URL}/?limit=10`);
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}/05-mobile.png` });
  await context.close();
}

await browser.close();
console.log(`screenshots written to ${OUT_DIR}`);
