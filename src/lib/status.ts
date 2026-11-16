import type { User } from "@/types/user";

export type UserStatus = "active" | "away";

/**
 * В dummyjson нет поля статуса аккаунта.
 * Чтобы колонка «Статус» была осмысленной и стабильной между рендерами,
 * выводим её детерминированно из id. Это синтетическое поле — см. README.
 */
export function getUserStatus(user: Pick<User, "id">): UserStatus {
  return user.id % 8 === 0 ? "away" : "active";
}

export const userStatusLabels: Record<UserStatus, string> = {
  active: "Активен",
  away: "Не в сети",
};
