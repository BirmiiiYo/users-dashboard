import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand text-brand-ink shadow-sm hover:opacity-90 active:opacity-100",
  secondary: "border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-hover",
  ghost: "text-ink hover:bg-surface-hover",
  danger: "border border-danger/40 bg-transparent text-danger hover:bg-danger-soft",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-md px-2.5 text-xs",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  icon: "size-9 shrink-0 rounded-lg",
};

export function buttonStyles({
  variant = "secondary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors duration-150 ease-ui select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonStyles({ variant, size, className })} {...props} />
  );
});
