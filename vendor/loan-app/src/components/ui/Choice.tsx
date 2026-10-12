import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

type Option<V extends string | number> = { value: V; label: string; description?: string; badge?: ReactNode };

type GroupProps<V extends string | number> = {
  name: string;
  options: readonly Option<V>[];
  value: V | undefined;
  onChange: (value: V) => void;
  invalid?: boolean;
};

/** Radio cards: a stack of selectable cards with optional description and badge. */
export function RadioCards<V extends string | number>({ name, options, value, onChange, invalid, columns = 1 }: GroupProps<V> & { columns?: 1 | 2 }) {
  return (
    <div className={clsx("grid gap-2.5", columns === 2 && "sm:grid-cols-2")}>
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={clsx(
              "relative flex cursor-pointer items-start gap-3 rounded-md border bg-raised p-4 transition-colors duration-150",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              checked
                ? "border-brand-mark bg-brand-tint shadow-[inset_0_0_0_0.5px_var(--border-brand)]"
                : invalid
                  ? "border-danger hover:bg-subtle"
                  : "border-line hover:border-line-control",
            )}
          >
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              className="sr-only"
              checked={checked}
              onChange={() => onChange(o.value)}
            />
            <span
              aria-hidden
              className={clsx(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                checked ? "border-ink bg-ink" : "border-line-control bg-raised",
              )}
            >
              {checked && <span className="size-2 rounded-full bg-raised" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2 font-medium text-fg">
                {o.label}
                {o.badge}
              </span>
              {o.description && <span className="text-small text-fg-muted">{o.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Segmented chips for short, mutually exclusive answers (ranges, durations). */
export function Chips<V extends string | number>({ name, options, value, onChange, invalid }: GroupProps<V>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={clsx(
              "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-small font-medium transition-colors duration-150",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              checked
                ? "border-ink bg-ink text-fg-on-action"
                : clsx("bg-raised text-fg hover:bg-subtle", invalid ? "border-danger" : "border-line-control"),
            )}
          >
            <input type="radio" name={name} value={String(o.value)} className="sr-only" checked={checked} onChange={() => onChange(o.value)} />
            {checked && <Check aria-hidden className="size-4" />}
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/** Large checkbox card used for explicit consent. */
export function CheckCard({
  checked,
  onChange,
  title,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-start gap-3.5 rounded-md border bg-raised p-4 transition-colors duration-150",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        checked ? "border-ink" : "border-line hover:border-line-control",
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={clsx(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border transition-colors",
          checked ? "border-ink bg-ink text-fg-on-action" : "border-line-control bg-raised",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-medium text-fg">{title}</span>
        <span className="text-small text-fg-muted">{children}</span>
      </span>
    </label>
  );
}
