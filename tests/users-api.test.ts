import { describe, expect, it, vi } from "vitest";
import { DEFAULT_USERS_QUERY } from "@/features/users/model/params";
import { USERS_CACHE_TAG, UsersApiError, getUsersForExport, getUsersPage } from "@/features/users/api/users-api";
import { makeUser } from "./factories";

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

const users = [
  makeUser({ id: 1, firstName: "Emily", lastName: "Johnson", age: 28, gender: "female" }),
  makeUser({ id: 2, firstName: "Michael", lastName: "Williams", age: 35, gender: "male" }),
];

describe("users-api", () => {
  it("запрашивает только разрешённые поля и не тянет чувствительные данные", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ users, total: 2, skip: 0, limit: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    await getUsersPage({ ...DEFAULT_USERS_QUERY, q: "em ily" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: unknown }];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/users/search");
    // регрессия: при конкатенации строк q забирал `limit`/`select` в себя
    expect(parsed.searchParams.get("q")).toBe("em ily");
    expect(parsed.searchParams.get("limit")).toBe("0");

    const select = new URL(url).searchParams.get("select") ?? "";
    for (const field of ["id", "firstName", "email", "company", "address"]) {
      expect(select).toContain(field);
    }
    for (const secret of ["password", "ssn", "bank", "crypto"]) {
      expect(select).not.toContain(secret);
    }

    expect(init.next).toEqual({ revalidate: 300, tags: [USERS_CACHE_TAG] });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("без запроса берёт полный список пользователей", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ users, total: 2, skip: 0, limit: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    await getUsersPage(DEFAULT_USERS_QUERY);

    const [url] = fetchMock.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/users");
    expect(parsed.searchParams.get("q")).toBeNull();
  });

  it("фильтрует, сортирует и пагинирует результат на сервере", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ users, total: 2, skip: 0, limit: 0 })),
    );

    const page = await getUsersPage({
      ...DEFAULT_USERS_QUERY,
      gender: "male",
      sortBy: "age",
      order: "desc",
      limit: 10,
    });

    expect(page.total).toBe(1);
    expect(page.users.map((user) => user.id)).toEqual([2]);
  });

  it("для CSV отдаёт полную выборку без пагинации", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ users, total: 2, skip: 0, limit: 0 })),
    );

    const exported = await getUsersForExport({ ...DEFAULT_USERS_QUERY, limit: 10 });
    expect(exported).toHaveLength(2);
  });

  it("превращает HTTP-ошибку в понятное исключение", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, { status: 500 })));

    await expect(getUsersPage(DEFAULT_USERS_QUERY)).rejects.toBeInstanceOf(UsersApiError);
  });

  it("падает явно, если ответ не той формы", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ users: "nope" })));

    await expect(getUsersPage(DEFAULT_USERS_QUERY)).rejects.toThrow(/формат/i);
  });

  it("сетевой сбой не пробрасывается как TypeError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(getUsersPage(DEFAULT_USERS_QUERY)).rejects.toThrow(/недоступен/i);
  });
});
