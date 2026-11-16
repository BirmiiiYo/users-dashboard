import type { Gender, UserRole } from "@/types/user";

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const SORT_FIELDS = ["name", "age", "company"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const GENDERS = ["female", "male"] as const satisfies readonly Gender[];
export const USER_ROLES = ["admin", "moderator", "user"] as const satisfies readonly UserRole[];

export const AGE_LIMITS = { min: 0, max: 120 } as const;

export interface UsersQuery {
  q: string;
  page: number;
  limit: PageSize;
  sortBy: SortField;
  order: SortOrder;
  gender: Gender | "";
  role: UserRole | "";
  ageMin: number | null;
  ageMax: number | null;
}

export const DEFAULT_USERS_QUERY: UsersQuery = {
  q: "",
  page: 1,
  limit: 20,
  sortBy: "name",
  order: "asc",
  gender: "",
  role: "",
  ageMin: null,
  ageMax: null,
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function readParam(params: RawSearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseEnum<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function parsePositiveInt(raw: string): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function parseAge(raw: string): number | null {
  const parsed = parsePositiveInt(raw);
  if (parsed === null) return null;
  return Math.min(Math.max(parsed, AGE_LIMITS.min), AGE_LIMITS.max);
}

/**
 * Единственный источник состояния экрана — URL.
 * Всё, что пришло невалидным (мусорный limit, отрицательная страница, чужой sortBy),
 * молча приводится к дефолту: экран не должен падать из-за ссылки.
 */
export function parseUsersQuery(params: RawSearchParams): UsersQuery {
  const limitRaw = Number(readParam(params, "limit"));
  const limit = (PAGE_SIZES as readonly number[]).includes(limitRaw)
    ? (limitRaw as PageSize)
    : DEFAULT_USERS_QUERY.limit;

  const page = parsePositiveInt(readParam(params, "page")) ?? 1;

  const ageMin = parseAge(readParam(params, "ageMin"));
  const ageMax = parseAge(readParam(params, "ageMax"));
  const [from, to] =
    ageMin !== null && ageMax !== null && ageMin > ageMax ? [ageMax, ageMin] : [ageMin, ageMax];

  return {
    q: readParam(params, "q").trim().slice(0, 100),
    page,
    limit,
    sortBy: parseEnum(readParam(params, "sortBy"), SORT_FIELDS, DEFAULT_USERS_QUERY.sortBy),
    order: parseEnum(readParam(params, "order"), SORT_ORDERS, DEFAULT_USERS_QUERY.order),
    gender: parseEnum(readParam(params, "gender"), GENDERS, ""),
    role: parseEnum(readParam(params, "role"), USER_ROLES, ""),
    ageMin: from,
    ageMax: to,
  };
}

/** Дефолты не пишем в URL — ссылка остаётся короткой, но состояние воспроизводится полностью. */
export function toSearchParams(query: UsersQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.limit !== DEFAULT_USERS_QUERY.limit) params.set("limit", String(query.limit));
  if (query.sortBy !== DEFAULT_USERS_QUERY.sortBy) params.set("sortBy", query.sortBy);
  if (query.order !== DEFAULT_USERS_QUERY.order) params.set("order", query.order);
  if (query.gender) params.set("gender", query.gender);
  if (query.role) params.set("role", query.role);
  if (query.ageMin !== null) params.set("ageMin", String(query.ageMin));
  if (query.ageMax !== null) params.set("ageMax", String(query.ageMax));

  return params;
}

export function usersQueryToHref(query: UsersQuery, pathname = "/"): string {
  const search = toSearchParams(query).toString();
  return search ? `${pathname}?${search}` : pathname;
}

export interface FilterPatch {
  q?: string;
  page?: number;
  limit?: PageSize;
  sortBy?: SortField;
  order?: SortOrder;
  gender?: Gender | "";
  role?: UserRole | "";
  ageMin?: number | null;
  ageMax?: number | null;
}

const RESET_PAGE_KEYS = ["q", "gender", "role", "ageMin", "ageMax", "limit"] as const;

/**
 * Накладывает изменения на текущий query.
 * Любое изменение выборки (поиск/фильтры/размер страницы) возвращает на первую страницу,
 * сортировка — нет: человек хочет остаться на той же странице.
 */
export function applyQueryPatch(current: UsersQuery, patch: FilterPatch): UsersQuery {
  const next: UsersQuery = { ...current, ...patch };

  const shouldResetPage =
    patch.page === undefined && RESET_PAGE_KEYS.some((key) => patch[key] !== undefined);
  if (shouldResetPage) next.page = 1;

  const min = next.ageMin;
  const max = next.ageMax;
  if (min !== null && max !== null && min > max) {
    next.ageMin = max;
    next.ageMax = min;
  }

  return next;
}

export interface ActiveFilter {
  key: "q" | "gender" | "role" | "age";
  label: string;
  value: string;
}

export function listActiveFilters(query: UsersQuery): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  if (query.q) filters.push({ key: "q", label: "Поиск", value: query.q });
  if (query.gender) {
    filters.push({
      key: "gender",
      label: "Пол",
      value: query.gender === "male" ? "Мужской" : "Женский",
    });
  }
  if (query.role) {
    filters.push({ key: "role", label: "Роль", value: roleLabels[query.role] });
  }
  if (query.ageMin !== null && query.ageMax !== null) {
    filters.push({ key: "age", label: "Возраст", value: `${query.ageMin}–${query.ageMax}` });
  } else if (query.ageMin !== null) {
    filters.push({ key: "age", label: "Возраст", value: `от ${query.ageMin}` });
  } else if (query.ageMax !== null) {
    filters.push({ key: "age", label: "Возраст", value: `до ${query.ageMax}` });
  }

  return filters;
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  moderator: "Модератор",
  user: "Пользователь",
};

export function hasActiveFilters(query: UsersQuery): boolean {
  return listActiveFilters(query).length > 0;
}
