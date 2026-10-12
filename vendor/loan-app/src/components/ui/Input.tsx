import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useField } from "./Field";

const control =
  "w-full rounded-sm border bg-raised px-3.5 text-fg placeholder:text-fg-placeholder transition-colors duration-150 " +
  "hover:border-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-0 focus-visible:border-focus";

/** Text input bound to its Field. `prefix` renders a fixed symbol such as ₦. */
type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> & { prefix?: ReactNode; size?: "md" | "lg" };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ prefix, size = "md", className, ...rest }, ref) {
    const field = useField();
    const input = (
      <input
        ref={ref}
        id={field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={clsx(
          control,
          size === "lg" ? "h-16 text-[28px] font-semibold tracking-tight tabular" : "h-12 text-body",
          field?.invalid ? "border-danger" : "border-line-control",
          prefix && (size === "lg" ? "pl-10" : "pl-9"),
          className,
        )}
        {...rest}
      />
    );
    if (!prefix) return input;
    return (
      <div className="relative">
        <span aria-hidden className={clsx("pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-fg-muted", size === "lg" && "text-[24px]")}>
          {prefix}
        </span>
        {input}
      </div>
    );
  },
);

/** Native select: the most reliable picker on low-end phones. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }>(
  function Select({ placeholder, className, children, ...rest }, ref) {
    const field = useField();
    return (
      <div className="relative">
        <select
          ref={ref}
          id={field?.id}
          aria-describedby={field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          className={clsx(
            control,
            "h-12 appearance-none pr-10 text-body",
            field?.invalid ? "border-danger" : "border-line-control",
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-icon" />
      </div>
    );
  },
);
