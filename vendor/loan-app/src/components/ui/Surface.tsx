import type { ReactNode } from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Banknote, CheckCheck, CircleAlert, CircleCheck, CircleX, Clock, ScanSearch } from "lucide-react";

/** White card with an optional mono eyebrow header and trailing action. */
export function Card({
  eyebrow,
  action,
  children,
  className,
  padded = true,
  emphasis = false,
}: {
  emphasis?: boolean;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={clsx("rounded-lg border bg-raised", emphasis ? "border-ink" : "border-line", className)}>
      {eyebrow && (
        <header className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-5 py-2">
          <h2 className="text-eyebrow text-fg-muted">{eyebrow}</h2>
          {action}
        </header>
      )}
      <div className={clsx(padded && "p-5")}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("text-eyebrow text-fg-muted", className)}>{children}</p>;
}

type Tone = "brand" | "success" | "warning" | "danger" | "neutral" | "info";
const tones: Record<Tone, string> = {
  brand: "bg-brand-tint text-fg-brand",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger-fg",
  info: "bg-info-bg text-info-fg",
  neutral: "bg-subtle text-fg-muted",
};

/** Status pill. Always pair with an icon or a word — never color alone. */
export function Badge({ tone = "neutral", icon, children }: { tone?: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-caption font-medium", tones[tone])}>
      {icon}
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "brand",
  label,
  className,
}: {
  value: number;
  tone?: "brand" | "danger" | "success";
  label: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const fill = { brand: "bg-brand-mark", danger: "bg-danger", success: "bg-success" }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-subtle", className)}
    >
      <motion.div
        className={clsx("h-full rounded-full", fill)}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={reduce ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/** Label/value row used in review and repayment summaries. */
export function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="text-small text-fg-muted">{label}</dt>
      <dd className={clsx("text-right tabular", strong ? "font-semibold text-fg" : "text-fg")}>{children}</dd>
    </div>
  );
}

/** Loan status. Each status carries a word and its own icon so it reads without color (grayscale, colorblind, washed-out screens). */
export const LOAN_STATUSES = {
  pending: { label: "Pending", tone: "warning", icon: Clock },
  in_review: { label: "In review", tone: "info", icon: ScanSearch },
  approved: { label: "Approved", tone: "success", icon: CircleCheck },
  disbursed: { label: "Disbursed", tone: "brand", icon: Banknote },
  paid: { label: "Paid", tone: "success", icon: CheckCheck },
  overdue: { label: "Overdue", tone: "danger", icon: CircleAlert },
  declined: { label: "Declined", tone: "neutral", icon: CircleX },
} as const;
export type LoanStatus = keyof typeof LOAN_STATUSES;

export function StatusChip({ status }: { status: LoanStatus }) {
  const s = LOAN_STATUSES[status];
  const Icon = s.icon;
  return (
    <Badge tone={s.tone} icon={<Icon aria-hidden className="size-3.5" strokeWidth={2.25} />}>
      {s.label}
    </Badge>
  );
}
