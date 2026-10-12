import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { LoaderCircle } from "lucide-react";

/** The single button primitive. `ink` moves forward, `brand` commits (once per flow), `outline` and `ghost` are secondary. */
type Variant = "ink" | "brand" | "outline" | "ghost";
type Size = "md" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  block?: boolean;
};

const variants: Record<Variant, string> = {
  ink: "bg-ink text-fg-on-action hover:bg-ink-hover active:bg-ink-pressed",
  brand: "bg-brand text-fg-on-action hover:bg-brand-hover active:bg-brand-pressed",
  outline: "bg-raised text-fg border border-line-control hover:bg-subtle",
  ghost: "text-fg hover:bg-subtle",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-body gap-2",
  sm: "h-9 px-3.5 text-small gap-1.5",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "ink", size = "md", iconLeft, iconRight, loading, block, className, children, disabled, type = "button", ...rest },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={clsx(
        "inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium",
        "transition-[background-color,transform] duration-150 active:scale-[0.98]",
        "disabled:pointer-events-none disabled:bg-disabled disabled:text-fg-disabled disabled:border-transparent",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
});
