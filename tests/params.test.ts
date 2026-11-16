import { describe, expect, it } from "vitest";
import {
  DEFAULT_USERS_QUERY,
  applyQueryPatch,
  hasActiveFilters,
  listActiveFilters,
  parseUsersQuery,
  toSearchParams,
  usersQueryToHref,
  type UsersQuery,
} from "@/features/users/model/params";

const query: UsersQuery = { ...DEFAULT_USERS_QUERY };

describe("parseUsersQuery", () => {
  it("возвращает дефолты на пустых параметрах", () => {
    expect(parseUsersQuery({})).toEqual(DEFAULT_USERS_QUERY);
  });

  it("не падает на мусоре в ссылке", () => {
    const parsed = parseUsersQuery({
      page: "-5",
      limit: "37",
      sortBy: "password",
      order: "up",
      gender: "other",
      role: "superadmin",
      ageMin: "abc",
      ageMax: "999",
    });

    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(DEFAULT_USERS_QUERY.limit);
    expect(parsed.sortBy).toBe(DEFAULT_USERS_QUERY.sortBy);
    expect(parsed.order).toBe(DEFAULT_USERS_QUERY.order);
    expect(parsed.gender).toBe("");
    expect(parsed.role).toBe("");
    expect(parsed.ageMin).toBeNull();
    // возраст клампится к верхней границе, а не отбрасывается
    expect(parsed.ageMax).toBe(120);
  });

  it("обменивает границы возраста местами, если их передали наоборот", () => {
    const parsed = parseUsersQuery({ ageMin: "50", ageMax: "20" });
    expect(parsed.ageMin).toBe(20);
    expect(parsed.ageMax).toBe(50);
  });

  it("обрезает поисковый запрос до 100 символов и убирает пробелы по краям", () => {
    const parsed = parseUsersQuery({ q: `  ${"a".repeat(150)}  ` });
    expect(parsed.q).toHaveLength(100);
    expect(parsed.q.startsWith(" ")).toBe(false);
  });

  it("берёт первое значение из массива (повторяющиеся параметры)", () => {
    expect(parseUsersQuery({ page: ["3", "9"] }).page).toBe(3);
  });
});

describe("toSearchParams", () => {
  it("не пишет дефолты в URL", () => {
    expect(toSearchParams(DEFAULT_USERS_QUERY).toString()).toBe("");
    expect(usersQueryToHref(DEFAULT_USERS_QUERY)).toBe("/");
  });

  it("пишет только изменённые поля", () => {
    const params = toSearchParams({ ...DEFAULT_USERS_QUERY, q: "em", page: 2, gender: "female" });
    expect(params.get("q")).toBe("em");
    expect(params.get("page")).toBe("2");
    expect(params.get("gender")).toBe("female");
    expect(params.has("limit")).toBe(false);
    expect(params.has("sortBy")).toBe(false);
  });

  it("round-trip: состояние воспроизводится из ссылки", () => {
    const initial: UsersQuery = {
      q: "ann",
      page: 3,
      limit: 50,
      sortBy: "age",
      order: "desc",
      gender: "male",
      role: "moderator",
      ageMin: 18,
      ageMax: 60,
    };
    const href = usersQueryToHref(initial);
    const search = href.split("?")[1] ?? "";
    const parsed = parseUsersQuery(Object.fromEntries(new URLSearchParams(search)));

    expect(parsed).toEqual(initial);
  });
});

describe("applyQueryPatch", () => {
  it("сбрасывает страницу при смене выборки", () => {
    const next = applyQueryPatch({ ...query, page: 5 }, { q: "em" });
    expect(next.page).toBe(1);
  });

  it("сбрасывает страницу при смене размера страницы", () => {
    expect(applyQueryPatch({ ...query, page: 5 }, { limit: 50 }).page).toBe(1);
  });

  it("не сбрасывает страницу при сортировке", () => {
    expect(applyQueryPatch({ ...query, page: 5 }, { sortBy: "age", order: "desc" }).page).toBe(5);
  });

  it("уважает явно переданную страницу", () => {
    expect(applyQueryPatch({ ...query, page: 2 }, { page: 7, q: "em" }).page).toBe(7);
  });

  it("не мутирует исходный объект", () => {
    const current = { ...query, page: 4 };
    applyQueryPatch(current, { q: "em" });
    expect(current.page).toBe(4);
  });
});

describe("listActiveFilters", () => {
  it("пустой query — нет активных фильтров", () => {
    expect(listActiveFilters(DEFAULT_USERS_QUERY)).toEqual([]);
    expect(hasActiveFilters(DEFAULT_USERS_QUERY)).toBe(false);
  });

  it("описывает все активные фильтры человекочитаемо", () => {
    const filters = listActiveFilters({
      ...DEFAULT_USERS_QUERY,
      q: "em",
      gender: "female",
      role: "admin",
      ageMin: 20,
      ageMax: 40,
    });

    expect(filters.map((filter) => filter.key)).toEqual(["q", "gender", "role", "age"]);
    expect(filters.find((filter) => filter.key === "age")?.value).toBe("20–40");
    expect(hasActiveFilters({ ...DEFAULT_USERS_QUERY, role: "admin" })).toBe(true);
  });

  it("показывает односторонние границы возраста", () => {
    expect(listActiveFilters({ ...DEFAULT_USERS_QUERY, ageMin: 30 })[0]?.value).toBe("от 30");
    expect(listActiveFilters({ ...DEFAULT_USERS_QUERY, ageMax: 30 })[0]?.value).toBe("до 30");
  });
});
