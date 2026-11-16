import { cache } from "react";
import type { User, UsersResponse } from "@/types/user";
import { buildUsersPage, filterUsers, sortUsers, type UsersPage } from "../model/user-query";
import type { UsersQuery } from "../model/params";

/**
 * Обоснование формата запросов — в README («Ограничения dummyjson»).
 * Коротко: API не умеет одновременно search + filter, а фильтр по возрасту
 * поддерживает только точное совпадение. Поэтому берём candidate set
 * (`/users/search` либо все пользователи) и фильтруем/сортируем/пагинируем на сервере.
 */
const API_BASE = process.env.DUMMYJSON_BASE_URL ?? "https://dummyjson.com";
const REVALIDATE_SECONDS = 300;
const REQUEST_TIMEOUT_MS = 8_000;
export const USERS_CACHE_TAG = "dummyjson-users";

/**
 * Явный whitelist полей: password, ssn, bank, crypto не нужны интерфейсу,
 * значит и в браузер (и в кэш) они не попадают.
 */
const USER_FIELDS = [
  "id",
  "firstName",
  "lastName",
  "maidenName",
  "age",
  "gender",
  "email",
  "phone",
  "username",
  "birthDate",
  "image",
  "bloodGroup",
  "height",
  "weight",
  "eyeColor",
  "hair",
  "ip",
  "university",
  "address",
  "company",
  "role",
] as const;

const USER_SELECT = USER_FIELDS.join(",");

export class UsersApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "UsersApiError";
    this.status = status;
  }
}

function isUsersResponse(value: unknown): value is UsersResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { users?: unknown };
  return Array.isArray(candidate.users);
}

/**
 * Параметры собираются через URLSearchParams, а не конкатенацией: при поиске
 * в путь уже входит `?q=...`, и склейка строк дала бы второй `?` — тогда
 * `q` забирал бы `limit`/`select` в себя (реальный баг, пойманный e2e).
 */
async function requestUsers(path: string, params: Record<string, string> = {}): Promise<User[]> {
  const query = new URLSearchParams({ limit: "0", select: USER_SELECT, ...params });
  const url = `${API_BASE}${path}?${query.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [USERS_CACHE_TAG] },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new UsersApiError("Сервис пользователей недоступен. Проверьте соединение.");
  }

  if (!response.ok) {
    throw new UsersApiError(
      `Сервис пользователей ответил ошибкой ${response.status}.`,
      response.status,
    );
  }

  const payload: unknown = await response.json();
  if (!isUsersResponse(payload)) {
    throw new UsersApiError("Неожиданный формат ответа от сервиса пользователей.");
  }

  return payload.users;
}

/** Дедупликация в рамках одного запроса + кэш Next по URL на REVALIDATE_SECONDS. */
const getCandidateUsers = cache(async (q: string): Promise<User[]> => {
  return q ? requestUsers("/users/search", { q }) : requestUsers("/users");
});

export async function getUsersPage(query: UsersQuery): Promise<UsersPage> {
  const candidates = await getCandidateUsers(query.q);
  return buildUsersPage(candidates, query);
}

/** Полная выборка для CSV: тот же фильтр и сортировка, но без пагинации. */
export async function getUsersForExport(query: UsersQuery): Promise<User[]> {
  const candidates = await getCandidateUsers(query.q);
  const filtered = filterUsers(candidates, query);
  return sortUsers(filtered, query.sortBy, query.order);
}
