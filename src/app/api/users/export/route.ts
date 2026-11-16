import { getUsersForExport } from "@/features/users/api/users-api";
import { parseUsersQuery, roleLabels } from "@/features/users/model/params";
import { csvFileName, toCsv } from "@/lib/csv";
import { formatBirthDate, formatGender } from "@/lib/format";
import { getUserStatus, userStatusLabels } from "@/lib/status";

export const dynamic = "force-dynamic";

const HEADER = [
  "Имя",
  "Фамилия",
  "Email",
  "Телефон",
  "Роль",
  "Пол",
  "Возраст",
  "Дата рождения",
  "Компания",
  "Должность",
  "Город",
  "Страна",
  "Статус",
] as const;

/**
 * CSV всей выборки по текущим фильтрам (не только видимой страницы).
 * Отдаём файл ответом с Content-Disposition — клиент не создаёт blob URL.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = parseUsersQuery(Object.fromEntries(url.searchParams));

  try {
    const users = await getUsersForExport(query);

    const rows = users.map((user) => [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      roleLabels[user.role],
      formatGender(user.gender),
      user.age,
      formatBirthDate(user.birthDate),
      user.company.name,
      user.company.title,
      user.address.city,
      user.address.country,
      userStatusLabels[getUserStatus(user)],
    ]);

    const csv = toCsv([HEADER, ...rows], { bom: true, delimiter: ";" });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvFileName("users")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CSV export failed", error);
    return new Response("Не удалось выгрузить данные. Попробуйте ещё раз.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
