import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

/** Чип активного фильтра: видно, что именно сужает выборку, и можно снять одним кликом. */
export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pr-1 pl-2.5 text-xs text-ink">
      <span className="text-muted">{label}:</span>
      <span className="font-medium">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать фильтр «${label}: ${value}»`}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-ui hover:bg-surface-hover hover:text-ink"
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}
