import type { User } from "@/types/user";
import type { SortField, SortOrder, UsersQuery } from "./params";

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

export type UserFilters = Pick<UsersQuery, "gender" | "role" | "ageMin" | "ageMax">;

/**
 * Локальные фильтры поверх candidate set.
 * Поиск (q) делает сам dummyjson (`/users/search`), потому что API не умеет
 * комбинировать search и filter — остальные условия накладываем здесь.
 */
export function filterUsers(users: readonly User[], filters: UserFilters): User[] {
  return users.filter((user) => {
    if (filters.gender && user.gender !== filters.gender) return false;
    if (filters.role && user.role !== filters.role) return false;
    if (filters.ageMin !== null && user.age < filters.ageMin) return false;
    if (filters.ageMax !== null && user.age > filters.ageMax) return false;
    return true;
  });
}

/** Сравнение по выбранному полю без учёта направления. */
function comparePrimary(a: User, b: User, field: SortField): number {
  switch (field) {
    case "name":
      return collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName);
    case "age":
      return a.age - b.age;
    case "company":
      return collator.compare(a.company.name, b.company.name);
  }
}

/**
 * Стабильная сортировка: направление переворачивает только первичный ключ,
 * тайбрейк по id всегда по возрастанию — иначе desc выглядит как «случайный» порядок.
 */
export function sortUsers(users: readonly User[], sortBy: SortField, order: SortOrder): User[] {
  const direction = order === "asc" ? 1 : -1;

  return [...users].sort((a, b) => {
    const primary = comparePrimary(a, b, sortBy) * direction;
    return primary !== 0 ? primary : a.id - b.id;
  });
}

export interface UsersPage {
  users: User[];
  /** Всего записей после фильтрации — это значение показывает «Всего N». */
  total: number;
  /** Реальная страница: может быть меньше запрошенной, если данных стало мало. */
  page: number;
  limit: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
}

/** Режет отсортированный набор на страницу и считает границы диапазона/страницы. */
export function paginateUsers(users: readonly User[], page: number, limit: number): UsersPage {
  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * limit;
  const pageUsers = users.slice(skip, skip + limit);

  return {
    users: pageUsers,
    total,
    page: safePage,
    limit,
    totalPages,
    rangeStart: total === 0 ? 0 : skip + 1,
    rangeEnd: total === 0 ? 0 : skip + pageUsers.length,
  };
}

export function buildUsersPage(candidates: readonly User[], query: UsersQuery): UsersPage {
  const filtered = filterUsers(candidates, query);
  const sorted = sortUsers(filtered, query.sortBy, query.order);
  return paginateUsers(sorted, query.page, query.limit);
}
