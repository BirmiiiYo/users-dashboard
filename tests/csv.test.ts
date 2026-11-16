import { describe, expect, it } from "vitest";
import { csvFileName, escapeCsvCell, toCsv } from "@/lib/csv";

describe("escapeCsvCell", () => {
  it("оставляет простые значения как есть", () => {
    expect(escapeCsvCell("Emily")).toBe("Emily");
    expect(escapeCsvCell(42)).toBe("42");
  });

  it("оборачивает в кавычки значения с разделителем и переводом строки", () => {
    // разделитель по умолчанию — `;`, поэтому запятая внутри поля кавычек не требует
    expect(escapeCsvCell("Иванов, Иван")).toBe("Иванов, Иван");
    expect(escapeCsvCell("Иванов; Иван")).toBe('"Иванов; Иван"');
    expect(escapeCsvCell("первая\nвторая")).toBe('"первая\nвторая"');
  });

  it("удваивает кавычки по RFC 4180", () => {
    expect(escapeCsvCell('Он сказал "привет"')).toBe('"Он сказал ""привет"""');
  });

  it("нейтрализует CSV-инъекции", () => {
    expect(escapeCsvCell("=1+1")).toBe("'=1+1");
    expect(escapeCsvCell("+79001234567")).toBe("'+79001234567");
    expect(escapeCsvCell("@user")).toBe("'@user");
    expect(escapeCsvCell("-5")).toBe("'-5");
  });

  it("null и undefined превращаются в пустую строку", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });

  it("учитывает кастомный разделитель", () => {
    expect(escapeCsvCell("a,b", ",")).toBe('"a,b"');
    expect(escapeCsvCell("a,b", ";")).toBe("a,b");
  });
});

describe("toCsv", () => {
  it("собирает строки через CRLF и завершает файл переводом строки", () => {
    expect(toCsv([["id", "name"]])).toBe("id;name\r\n");
    expect(toCsv([["a", "b"], ["1", "2"]])).toBe("a;b\r\n1;2\r\n");
  });

  it("добавляет BOM, если попросили (Excel + кириллица)", () => {
    expect(toCsv([["имя"]], { bom: true }).startsWith("\uFEFF")).toBe(true);
  });

  it("пустой набор строк — пустая строка без хвоста", () => {
    expect(toCsv([])).toBe("");
  });
});

describe("csvFileName", () => {
  it("делает безопасное имя с датой", () => {
    expect(csvFileName("users", new Date("2026-03-05T10:00:00Z"))).toBe("users-2026-03-05.csv");
  });

  it("чистит недопустимые символы и пустой префикс", () => {
    expect(csvFileName("users/export 2026", new Date("2026-03-05T10:00:00Z"))).toBe(
      "users-export-2026-2026-03-05.csv",
    );
    expect(csvFileName("///", new Date("2026-03-05T10:00:00Z"))).toBe("export-2026-03-05.csv");
  });
});
