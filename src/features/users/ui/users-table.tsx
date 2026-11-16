"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { formatAge, formatGender, fullName } from "@/lib/format";
import type { User } from "@/types/user";
import { useUsersQuery } from "../model/users-query-context";
import type { SortField } from "../model/params";
import { RoleBadge, StatusBadge } from "./user-badges";
import { UserAvatar } from "./user-avatar";

function SortableTh({ field, children }: { field: SortField; children: ReactNode }) {
  const { query, update } = useUsersQuery();
  const isActive = query.sortBy === field;
  const isAscending = query.order === "asc";
  const Icon = !isActive ? ArrowUpDown : isAscending ? ArrowUp : ArrowDown;

  return (
    <Th sort={isActive ? (isAscending ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => update({ sortBy: field, order: isActive && isAscending ? "desc" : "asc" })}
        className="inline-flex items-center gap-1.5 rounded text-xs font-semibold tracking-wide uppercase transition-colors duration-150 ease-ui hover:text-ink"
      >
        {children}
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", isActive ? "text-brand" : "text-muted/60")}
        />
      </button>
    </Th>
  );
}

interface UsersTableProps {
  users: readonly User[];
  onSelect: (user: User) => void;
  className?: string;
}

/** Таблица для ≥md; на мобиле её заменяют карточки. */
export function UsersTable({ users, onSelect, className }: UsersTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-surface shadow-sm",
        className,
      )}
    >
      <Table caption={`Пользователи, найдено ${users.length} на странице`}>
        <THead>
          <tr>
            <SortableTh field="name">Пользователь</SortableTh>
            <Th>Email</Th>
            <Th>Роль</Th>
            <SortableTh field="age">Возраст / пол</SortableTh>
            <SortableTh field="company">Компания</SortableTh>
            <Th>Город</Th>
            <Th>Статус</Th>
          </tr>
        </THead>
        <TBody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onSelect(user)}
              className="group cursor-pointer transition-colors duration-150 ease-ui hover:bg-surface-hover/70 focus-within:bg-surface-hover/70"
            >
              <Td>
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(user);
                      }}
                      className="block max-w-[220px] truncate text-left font-medium text-ink group-hover:underline"
                    >
                      {fullName(user)}
                    </button>
                    <span className="block truncate text-xs text-muted">@{user.username}</span>
                  </div>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <span className="max-w-[200px] truncate" title={user.email}>
                    {user.email}
                  </span>
                  <CopyButton value={user.email} label={`email ${fullName(user)}`} />
                </div>
              </Td>
              <Td>
                <RoleBadge role={user.role} />
              </Td>
              <Td className="whitespace-nowrap">
                <span className="font-medium text-ink">{formatAge(user.age)}</span>
                <span className="ml-1 text-xs text-muted">· {formatGender(user.gender)}</span>
              </Td>
              <Td>
                <span className="block max-w-[200px] truncate font-medium text-ink">
                  {user.company.name}
                </span>
                <span className="block max-w-[200px] truncate text-xs text-muted">
                  {user.company.title}
                </span>
              </Td>
              <Td className="whitespace-nowrap">{user.address.city}</Td>
              <Td>
                <StatusBadge user={user} />
              </Td>
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
