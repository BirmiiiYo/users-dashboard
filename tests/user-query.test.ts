import { describe, expect, it } from "vitest";
import {
  buildUsersPage,
  filterUsers,
  paginateUsers,
  sortUsers,
} from "@/features/users/model/user-query";
import { DEFAULT_USERS_QUERY } from "@/features/users/model/params";
import { makeUser } from "./factories";

const users = [
  makeUser({ id: 1, firstName: "Emily", lastName: "Johnson", age: 28, gender: "female" }),
  makeUser({ id: 2, firstName: "Michael", lastName: "Williams", age: 35, gender: "male" }),
  makeUser({ id: 3, firstName: "Sophia", lastName: "Brown", age: 42, gender: "female" }),
  makeUser({
    id: 4,
    firstName: "James",
    lastName: "Davis",
    age: 28,
    gender: "male",
    company: { ...makeUser().company, name: "Alpha Labs" },
  }),
  makeUser({
    id: 5,
    firstName: "Olivia",
    lastName: "Anderson",
    age: 51,
    gender: "female",
    role: "user",
    company: { ...makeUser().company, name: "Zeta Corp" },
  }),
];

describe("filterUsers", () => {
  it("фильтрует по полу, роли и возрасту одновременно", () => {
    const filtered = filterUsers(users, {
      gender: "female",
      role: "",
      ageMin: 30,
      ageMax: 50,
    });

    expect(filtered.map((user) => user.id)).toEqual([3]);
  });

  it("пустые фильтры ничего не отбрасывают", () => {
    expect(
      filterUsers(users, { gender: "", role: "", ageMin: null, ageMax: null }),
    ).toHaveLength(users.length);
  });

  it("не мутирует исходный массив", () => {
    const snapshot = [...users];
    filterUsers(users, { gender: "male", role: "", ageMin: null, ageMax: null });
    expect(users).toEqual(snapshot);
  });
});

describe("sortUsers", () => {
  it("сортирует по фамилии, затем по имени", () => {
    const sorted = sortUsers(users, "name", "asc");
    expect(sorted.map((user) => user.lastName)).toEqual([
      "Anderson",
      "Brown",
      "Davis",
      "Johnson",
      "Williams",
    ]);
  });

  it("переворачивает направление только по первичному ключу", () => {
    const asc = sortUsers(users, "age", "asc");
    const desc = sortUsers(users, "age", "desc");

    expect(asc.map((user) => user.age)).toEqual([28, 28, 35, 42, 51]);
    expect(desc.map((user) => user.age)).toEqual([51, 42, 35, 28, 28]);
    // ничья по возрасту решается стабильным тайбрейком по id даже в desc
    expect(desc.slice(-2).map((user) => user.id)).toEqual([1, 4]);
  });

  it("сортирует по названию компании", () => {
    expect(sortUsers(users, "company", "asc")[0]?.company.name).toBe("Alpha Labs");
  });

  it("возвращает новый массив", () => {
    const sorted = sortUsers(users, "age", "asc");
    expect(sorted).not.toBe(users);
  });
});

describe("paginateUsers", () => {
  it("режет на страницы и считает границы", () => {
    const page = paginateUsers(users, 2, 2);
    expect(page.users.map((user) => user.id)).toEqual([3, 4]);
    expect(page.total).toBe(5);
    expect(page.totalPages).toBe(3);
    expect(page.rangeStart).toBe(3);
    expect(page.rangeEnd).toBe(4);
  });

  it("клампит слишком большую страницу к последней", () => {
    const page = paginateUsers(users, 99, 2);
    expect(page.page).toBe(3);
    expect(page.users).toHaveLength(1);
  });

  it("отдаёт первую страницу при нуле или отрицательном значении", () => {
    expect(paginateUsers(users, 0, 2).page).toBe(1);
    expect(paginateUsers(users, -3, 2).page).toBe(1);
  });

  it("пустой набор — totalPages 1 и нулевые границы", () => {
    expect(paginateUsers([], 1, 20)).toMatchObject({
      total: 0,
      totalPages: 1,
      rangeStart: 0,
      rangeEnd: 0,
    });
  });
});

describe("buildUsersPage", () => {
  it("применяет фильтр, сортировку и пагинацию в правильном порядке", () => {
    const page = buildUsersPage(users, {
      ...DEFAULT_USERS_QUERY,
      gender: "male",
      sortBy: "age",
      order: "desc",
      limit: 10,
    });

    expect(page.total).toBe(2);
    expect(page.users.map((user) => user.id)).toEqual([2, 4]);
    expect(page.users.map((user) => user.age)).toEqual([35, 28]);
  });
});
