import { Badge, type BadgeTone } from "@/components/ui/badge";
import { getUserStatus, userStatusLabels } from "@/lib/status";
import type { User, UserRole } from "@/types/user";
import { roleLabels } from "../model/params";

const roleTones: Record<UserRole, BadgeTone> = {
  admin: "brand",
  moderator: "warning",
  user: "neutral",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={roleTones[role]}>{roleLabels[role]}</Badge>;
}

export function StatusBadge({ user }: { user: Pick<User, "id"> }) {
  const status = getUserStatus(user);
  return (
    <Badge tone={status === "active" ? "success" : "neutral"} dot>
      {userStatusLabels[status]}
    </Badge>
  );
}
