export type CsvValue = string | number | boolean | null | undefined;

export interface CsvOptions {
  /** Excel в русской локали ждёт `;`, иначе всё склеивается в одну колонку. */
  delimiter?: string;
  eol?: string;
  /** BOM нужен Excel, чтобы не ломать кириллицу. */
  bom?: boolean;
}

const FORMULA_START = /^[=@\t\r]/;
/** Телефон или число со знаком: `+1 450-865-6061`, `+79001234567`, `-12` — значения, а не формулы. */
const SIGNED_VALUE = /^[+-][\d\s\-().]+$/;

/**
 * Excel исполняет как формулу только `=`, `@`, tab/CR и «выражения» на `+`/`-`.
 * Числа и телефоны со знаком к ним не относятся — их нельзя портить апострофом,
 * иначе колонка «Телефон» в выгрузке выглядит сломанной (`'+1 450-...`).
 */
function isFormulaLike(raw: string): boolean {
  if (FORMULA_START.test(raw)) return true;
  if (/^[+-]/.test(raw)) return !SIGNED_VALUE.test(raw);
  return false;
}

/**
 * Экранирует одно значение по RFC 4180 и нейтрализует CSV-инъекции
 * (ячейка, начинающаяся с `=`/`+`/`-`/`@`, выполнится в Excel как формула).
 */
export function escapeCsvCell(value: CsvValue, delimiter = ";"): string {
  const raw = value == null ? "" : String(value);
  const safe = isFormulaLike(raw) ? `'${raw}` : raw;
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
