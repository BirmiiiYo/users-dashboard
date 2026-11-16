import { expect, test } from "@playwright/test";

/**
 * Happy path, которым проверяю фичу руками:
 * список отрисовался → поиск меняет URL и данные → карточка открывается/закрывается → консоль чистая.
 */
test("список, поиск и карточка пользователя", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Пользователи" })).toBeVisible();

  const rows = page.locator("tbody tr");
  await expect(rows.first()).toBeVisible();
  const initialCount = await rows.count();
  expect(initialCount).toBeGreaterThan(0);
  await expect(page.locator('p[role="status"]')).toContainText("Всего");

  // поиск: debounce → URL и данные обновились, тулбар не потерял фокус
  const search = page.getByRole("searchbox", { name: /Поиск по имени/i });
  await search.fill("em");
  await expect(page).toHaveURL(/[?&]q=em/);
  await expect(page.locator('p[role="status"]')).toContainText("Всего");
  // регрессия: раньше `q` съедал `limit` и поиск отдавал 0 результатов
  await expect(page.locator('p[role="status"]')).not.toContainText("Всего 0");
  await expect(rows.first()).toBeVisible();
  await expect(search).toBeFocused();

  // карточка: открывается кликом по имени, закрывается по Esc
  await rows.first().getByRole("button").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  // состояние фильтров воспроизводится из ссылки
  await page.goto("/?q=a&gender=female&page=2&limit=10&sortBy=age&order=desc");
  await expect(page.locator('p[role="status"]')).toContainText("Всего");
  await expect(page.getByRole("searchbox", { name: /Поиск по имени/i })).toHaveValue("a");

  expect(consoleErrors, `ошибки в консоли: ${consoleErrors.join(" | ")}`).toEqual([]);
});

test("тема переключается и переживает перезагрузку", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("tbody tr").first()).toBeVisible();

  const toggle = page.getByTestId("theme-toggle");
  const state = () =>
    page.evaluate(() => ({
      theme: document.documentElement.dataset.theme ?? "",
      mode: document.documentElement.dataset.themeMode ?? "",
      stored: localStorage.getItem("users-dashboard-theme"),
    }));

  // доводим режим именно до явного «light» (system тоже может резолвиться в светлую, но не пишется в storage)
  for (let i = 0; i < 3; i += 1) {
    const current = await state();
    if (current.mode === "light") break;
    await toggle.click();
    await expect.poll(async () => (await state()).mode).toBe("light");
  }
  expect((await state()).stored).toBe("light");

  await page.reload();
  await expect(page.locator("tbody tr").first()).toBeVisible();
  // регрессия: эффект «как в системе» перетирал сохранённый выбор при гидрации
  await expect.poll(async () => (await state()).theme).toBe("light");
  await expect.poll(async () => (await state()).stored).toBe("light");
});
