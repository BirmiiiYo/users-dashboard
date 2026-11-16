"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { AGE_LIMITS, GENDERS, USER_ROLES, roleLabels, type UsersQuery } from "../model/params";
import { useUsersQuery } from "../model/users-query-context";

const toInput = (value: number | null) => (value === null ? "" : String(value));

function toNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(Math.max(Math.trunc(parsed), AGE_LIMITS.min), AGE_LIMITS.max);
}

/**
 * Диапазон возраста: API умеет только точное совпадение (`/filter?key=age&value=40`),
 * поэтому фильтр считается на сервере поверх candidate set — см. README.
 * Ввод дебаунсится, чтобы не дёргать навигацию на каждую цифру.
 */
function AgeRangeFields() {
  const { query, update } = useUsersQuery();
  const minId = useId();
  const maxId = useId();
  const [min, setMin] = useState(() => toInput(query.ageMin));
  const [max, setMax] = useState(() => toInput(query.ageMax));
  const debouncedMin = useDebouncedValue(min, 400);
  const debouncedMax = useDebouncedValue(max, 400);

  const latestQuery = useRef<UsersQuery>(query);
  useEffect(() => {
    latestQuery.current = query;
  }, [query]);

  // Внешнее изменение (чип, сброс, кнопка «назад») возвращает значения в поля.
  useEffect(() => {
    setMin(toInput(query.ageMin));
    setMax(toInput(query.ageMax));
  }, [query.ageMin, query.ageMax]);

  useEffect(() => {
    const nextMin = toNumber(debouncedMin);
    const nextMax = toNumber(debouncedMax);
    if (nextMin === latestQuery.current.ageMin && nextMax === latestQuery.current.ageMax) return;
    update({ ageMin: nextMin, ageMax: nextMax });
  }, [debouncedMin, debouncedMax, update]);

  return (
    <>
      <Field label="Возраст от" htmlFor={minId}>
        <Input
          id={minId}
          type="number"
          inputMode="numeric"
          min={AGE_LIMITS.min}
          max={AGE_LIMITS.max}
          value={min}
          onChange={(event) => setMin(event.target.value)}
          placeholder="18"
        />
      </Field>
      <Field label="Возраст до" htmlFor={maxId}>
        <Input
          id={maxId}
          type="number"
          inputMode="numeric"
          min={AGE_LIMITS.min}
          max={AGE_LIMITS.max}
          value={max}
          onChange={(event) => setMax(event.target.value)}
          placeholder="65"
        />
      </Field>
    </>
  );
}

export function UsersFilters() {
  const { query, update } = useUsersQuery();
  const genderId = useId();
  const roleId = useId();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[430px]">
      <Field label="Пол" htmlFor={genderId}>
        <Select
          id={genderId}
          value={query.gender}
          onChange={(event) => update({ gender: event.target.value as UsersQuery["gender"] })}
        >
          <option value="">Любой</option>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender === "male" ? "Мужской" : "Женский"}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Роль" htmlFor={roleId}>
        <Select
          id={roleId}
          value={query.role}
          onChange={(event) => update({ role: event.target.value as UsersQuery["role"] })}
        >
          <option value="">Любая</option>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </Select>
      </Field>

      <AgeRangeFields />
    </div>
  );
}
