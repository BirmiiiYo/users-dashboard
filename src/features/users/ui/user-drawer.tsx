"use client";

import type { ReactNode } from "react";
import { Drawer } from "@/components/ui/drawer";
import { CopyButton } from "@/components/ui/copy-button";
import { formatAge, formatBirthDate, formatGender, formatHeight, formatWeight, fullName } from "@/lib/format";
import type { User } from "@/types/user";
import { RoleBadge, StatusBadge } from "./user-badges";
import { UserAvatar } from "./user-avatar";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-4 first:pt-1 last:border-0">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">{children}</dl>
    </section>
  );
}

function Detail({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm break-words text-ink">{value}</dd>
    </div>
  );
}

function UserDetails({ user }: { user: User }) {
  const { address, company } = user;

  return (
    <>
      <div className="flex items-center gap-3 pb-2">
        <UserAvatar user={user} size={56} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{fullName(user)}</p>
          <p className="truncate text-xs text-muted">@{user.username}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <RoleBadge role={user.role} />
            <StatusBadge user={user} />
          </div>
        </div>
      </div>

      <Section title="Контакты">
        <Detail
          label="Email"
          wide
          value={
            <span className="flex items-center gap-1">
              <a href={`mailto:${user.email}`} className="truncate underline-offset-2 hover:underline">
                {user.email}
              </a>
              <CopyButton value={user.email} label="email" />
            </span>
          }
        />
        <Detail
          label="Телефон"
          value={
            <a href={`tel:${user.phone}`} className="underline-offset-2 hover:underline">
              {user.phone}
            </a>
          }
        />
        <Detail label="IP" value={user.ip} />
      </Section>

      <Section title="Компания">
        <Detail label="Название" wide value={company.name} />
        <Detail label="Отдел" value={company.department} />
        <Detail label="Должность" value={company.title} />
        <Detail label="Адрес офиса" wide value={`${company.address.city}, ${company.address.address}`} />
      </Section>

      <Section title="Адрес">
        <Detail label="Улица" value={address.address} />
        <Detail label="Город" value={address.city} />
        <Detail label="Штат" value={`${address.state} (${address.stateCode})`} />
        <Detail label="Индекс" value={address.postalCode} />
        <Detail label="Страна" value={address.country} />
        <Detail
          label="Координаты"
          value={`${address.coordinates.lat.toFixed(3)}, ${address.coordinates.lng.toFixed(3)}`}
        />
      </Section>

      <Section title="Физические данные">
        <Detail label="Возраст" value={formatAge(user.age)} />
        <Detail label="Дата рождения" value={formatBirthDate(user.birthDate)} />
        <Detail label="Пол" value={formatGender(user.gender)} />
        <Detail label="Группа крови" value={user.bloodGroup} />
        <Detail label="Рост" value={formatHeight(user.height)} />
        <Detail label="Вес" value={formatWeight(user.weight)} />
        <Detail label="Глаза" value={user.eyeColor} />
        <Detail label="Волосы" value={`${user.hair.color}, ${user.hair.type}`} />
      </Section>

      <Section title="Прочее">
        <Detail label="Университет" wide value={user.university} />
        {user.maidenName ? <Detail label="Девичья фамилия" wide value={user.maidenName} /> : null}
      </Section>
    </>
  );
}

interface UserDrawerProps {
  user: User | null;
  onClose: () => void;
}

export function UserDrawer({ user, onClose }: UserDrawerProps) {
  return (
    <Drawer
      open={user !== null}
      onClose={onClose}
      title={user ? fullName(user) : ""}
      description={user ? `${user.company.title}, ${user.company.name}` : undefined}
    >
      {user ? <UserDetails user={user} /> : null}
    </Drawer>
  );
}
