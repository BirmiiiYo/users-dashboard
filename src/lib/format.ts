import type { User } from "@/types/user";

export function fullName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function initials(user: Pick<User, "firstName" | "lastName">): string {
  const first = user.firstName.charAt(0);
  const last = user.lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function formatAge(age: number): string {
  return `${age} ${pluralizeRu(age, ["год", "года", "лет"])}`;
}

export function formatGender(gender: User["gender"]): string {
  return gender === "male" ? "Мужской" : "Женский";
}

export function formatHeight(heightInCm: number): string {
  return `${Math.round(heightInCm)} см`;
}

export function formatWeight(weightInKg: number): string {
  return `${weightInKg.toFixed(1)} кг`;
}

/**
 * dummyjson отдаёт `birthDate` как `1996-5-30` (без ведущих нулей),
 * поэтому `new Date(str)` ведёт себя по-разному в браузерах — парсим руками.
 */
export function formatBirthDate(birthDate: string): string {
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) return birthDate;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(day)}.${pad(month)}.${year}`;
}

export function formatCity(user: Pick<User, "address">): string {
  return user.address.city;
}

/** 1 пользователь / 2 пользователя / 5 пользователей */
export function pluralizeRu(count: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const tail = abs % 10;

  if (abs > 10 && abs < 20) return forms[2];
  if (tail > 1 && tail < 5) return forms[1];
  if (tail === 1) return forms[0];
  return forms[2];
}
