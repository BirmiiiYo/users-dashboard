import Image from "next/image";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import type { User } from "@/types/user";

interface UserAvatarProps {
  user: Pick<User, "firstName" | "lastName" | "image" | "username">;
  size?: 32 | 40 | 56;
  className?: string;
}

/**
 * Аватар через next/image: dummyjson отдаёт PNG 128×128,
 * оптимизатор режет его под нужный размер и формат (AVIF/WebP).
 */
export function UserAvatar({ user, size = 40, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-hover text-muted",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span aria-hidden="true" className="absolute text-[0.7em] font-medium">
        {initials(user)}
      </span>
      <Image
        src={user.image}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        sizes={`${size}px`}
        className="relative size-full object-cover"
      />
    </span>
  );
}
