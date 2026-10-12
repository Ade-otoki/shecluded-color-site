import { createContext, useContext, useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { clsx } from "clsx";

/** Label, hint, "why we ask" help and error for one control. Controls read ids from context. */
type FieldIds = { id: string; describedBy: string | undefined; invalid: boolean };
const FieldContext = createContext<FieldIds | null>(null);
export const useField = () => useContext(FieldContext);

type Props = {
  label: string;
  hint?: string;
  why?: string;
  error?: string;
  optional?: boolean;
  /** Group fields (radio cards, chips) render a fieldset + legend instead of label. */
  as?: "field" | "group";
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, why, error, optional, as = "field", children, className }: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const labelNode = (
    <span className="flex items-baseline gap-2 text-small font-medium text-fg">
      {label}
      {optional && <span className="font-normal text-fg-muted">Optional</span>}
    </span>
  );

  const below = (
    <>
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-small text-danger-fg">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-small text-fg-muted">
          {hint}
        </p>
      ) : null}
      {why && (
        <details className="group text-small">
          <summary className="w-fit cursor-pointer list-none text-fg-muted underline decoration-line-control underline-offset-4 hover:text-fg [&::-webkit-details-marker]:hidden">
            Why we ask
          </summary>
          <p className="mt-2 rounded-sm bg-subtle px-3 py-2 text-fg-muted">{why}</p>
        </details>
      )}
    </>
  );

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error) }}>
      {as === "group" ? (
        <fieldset className={clsx("flex flex-col gap-2", className)} aria-describedby={describedBy}>
          <legend className="mb-2">{labelNode}</legend>
          {children}
          {below}
        </fieldset>
      ) : (
        <div className={clsx("flex flex-col gap-2", className)}>
          <label htmlFor={id}>{labelNode}</label>
          {children}
          {below}
        </div>
      )}
    </FieldContext.Provider>
  );
}
