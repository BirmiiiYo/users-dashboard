export type CsvValue = string | number | boolean | null | undefined;

export interface CsvOptions {
  /** Excel в русской локали ждёт `;`, иначе всё склеивается в одну колонку. */
  delimiter?: string;
  eol?: string;
  /** BOM нужен Excel, чтобы не ломать кириллицу. */
  bom?: boolean;
}

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/**
 * Экранирует одно значение по RFC 4180 и нейтрализует CSV-инъекции
 * (ячейка, начинающаяся с `=`, `+`, `-`, `@`, выполнится в Excel как формула).
 */
export function escapeCsvCell(value: CsvValue, delimiter = ";"): string {
  const raw = value == null ? "" : String(value);
  const safe = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
  const needsQuotes =
    safe.includes('"') || safe.includes("\n") || safe.includes("\r") || safe.includes(delimiter);

  return needsQuotes ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function toCsv(rows: readonly (readonly CsvValue[])[], options: CsvOptions = {}): string {
  const { delimiter = ";", eol = "\r\n", bom = false } = options;
  const body = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter))
    .join(eol);

  return `${bom ? "\uFEFF" : ""}${body}${body ? eol : ""}`;
}

/** Имя файла безопасно для Content-Disposition и Windows-проводника. */
export function csvFileName(prefix: string, date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  const safePrefix = prefix.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "export";
  return `${safePrefix}-${stamp}.csv`;
}
