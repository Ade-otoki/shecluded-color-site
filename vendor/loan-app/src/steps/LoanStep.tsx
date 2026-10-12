import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import {
  CATEGORIES,
  DURATIONS,
  FREQUENCIES,
  LOAN_MAX,
  LOAN_MIN,
  LOAN_STEP,
  MONTHLY_RATE,
  PURPOSES,
  REPAYMENT_METHODS,
  SMART_DEFAULTS,
  formatNaira,
  labelOf,
  loanSchema,
  repayment,
  type Loan,
} from "../lib/application";
import { useApplication } from "../lib/store";
import { useStepNav } from "./useStepNav";
import { StepLayout } from "../components/flow/Shell";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Chips, RadioCards } from "../components/ui/Choice";
import { Badge, Card, Row } from "../components/ui/Surface";
import { Button } from "../components/ui/Button";

const digits = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const grouped = (n: number) => (n ? n.toLocaleString("en-NG") : "");

export function LoanStep() {
  const { app, updateLoan, go } = useApplication();
  const { next, nextLabel, editing } = useStepNav("loan", "documents", "Continue to documents");
  const category = app.business.category;
  const suggestion = category ? SMART_DEFAULTS[category] : undefined;

  const { control, handleSubmit, watch, formState } = useForm<Loan>({
    resolver: zodResolver(loanSchema),
    defaultValues: app.loan as Loan,
    mode: "onTouched",
  });
  const { errors } = formState;

  useEffect(() => {
    const sub = watch((values, { name }) => {
      if (name) updateLoan({ [name]: values[name as keyof Loan] } as Partial<Loan>);
    });
    return () => sub.unsubscribe();
  }, [watch, updateLoan]);

  const amount = watch("amount") ?? 0;
  const durationMonths = watch("durationMonths") ?? 6;
  const frequency = watch("frequency") ?? "monthly";
  const quote = repayment({ amount: Math.min(Math.max(amount, LOAN_MIN), LOAN_MAX), durationMonths, frequency });
  const perLabel = frequency === "monthly" ? "per month" : "every 2 weeks";

  return (
    <form noValidate onSubmit={handleSubmit(next)}>
      <StepLayout
        step="loan"
        title="How much do you need?"
        description="Adjust the amount and term. Your repayment updates as you go."
        onBack={() => go("business")}
        actions={
          <>
            {!editing && (
              <Button variant="ghost" iconLeft={<ArrowLeft aria-hidden className="size-4" />} onClick={() => go("business")}>
                Back
              </Button>
            )}
            <Button type="submit" iconRight={<ArrowRight aria-hidden className="size-4" />} className="max-lg:flex-1">
              {nextLabel}
            </Button>
          </>
        }
      >
        {suggestion && !app.loanTouched && (
          <div className="flex items-start gap-3 rounded-md border border-line bg-brand-tint px-4 py-3.5">
            <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0 text-fg-brand" />
            <p className="text-small text-fg">
              <span className="font-medium">We've pre-filled a few answers for {labelOf(CATEGORIES, category).toLowerCase()}.</span>{" "}
              <span className="text-fg-muted">{suggestion.reason} Change anything that doesn't fit.</span>
            </p>
          </div>
        )}

        <Card eyebrow="Amount">
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <div className="flex flex-col gap-5">
                <Field label="Loan amount" hint={`Between ${formatNaira(LOAN_MIN)} and ${formatNaira(LOAN_MAX)}`} error={errors.amount?.message}>
                  <Input
                    prefix="₦"
                    inputMode="numeric"
                    size="lg"
                    value={grouped(field.value)}
                    onChange={(e) => field.onChange(digits(e.target.value))}
                    onBlur={field.onBlur}
                  />
                </Field>
                <input
                  type="range"
                  aria-label="Loan amount slider"
                  min={LOAN_MIN}
                  max={LOAN_MAX}
                  step={LOAN_STEP}
                  value={Math.min(Math.max(field.value || LOAN_MIN, LOAN_MIN), LOAN_MAX)}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="range"
                  style={{ ["--fill" as string]: `${((Math.min(Math.max(field.value || LOAN_MIN, LOAN_MIN), LOAN_MAX) - LOAN_MIN) / (LOAN_MAX - LOAN_MIN)) * 100}%` }}
                />
                <div className="-mt-3 flex justify-between text-caption text-fg-muted tabular">
                  <span>{formatNaira(LOAN_MIN)}</span>
                  <span>{formatNaira(LOAN_MAX)}</span>
                </div>
              </div>
            )}
          />
        </Card>

        <Card eyebrow="What it's for">
          <Field label="What will you use the loan for?" as="group" error={errors.purpose?.message}>
            <Controller
              control={control}
              name="purpose"
              render={({ field }) => (
                <RadioCards
                  name="purpose"
                  columns={2}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.purpose}
                  options={PURPOSES.map((p) => ({
                    ...p,
                    badge: suggestion?.purpose === p.value ? <Badge tone="brand">Suggested</Badge> : undefined,
                  }))}
                />
              )}
            />
          </Field>
        </Card>

        <Card eyebrow="Repayment">
          <div className="flex flex-col gap-6">
            <Field label="Loan term" as="group">
              <Controller
                control={control}
                name="durationMonths"
                render={({ field }) => (
                  <Chips name="durationMonths" value={field.value} onChange={field.onChange} options={DURATIONS.map((d) => ({ value: d, label: `${d} months` }))} />
                )}
              />
            </Field>
            <Field label="How often will you pay?" as="group" hint={`${quote.installments} payments in total`}>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => <Chips name="frequency" value={field.value} onChange={field.onChange} options={FREQUENCIES} />}
              />
            </Field>
            <Field label="How will you repay?" as="group" error={errors.repaymentMethod?.message}>
              <Controller
                control={control}
                name="repaymentMethod"
                render={({ field }) => (
                  <RadioCards
                    name="repaymentMethod"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.repaymentMethod}
                    options={REPAYMENT_METHODS.map((m) => ({
                      ...m,
                      badge: m.value === "direct_debit" ? <Badge tone="neutral">Recommended</Badge> : undefined,
                    }))}
                  />
                )}
              />
            </Field>
          </div>
        </Card>

        <Card eyebrow="Your repayment" emphasis>
          <div aria-live="polite">
            <p className="text-small text-fg-muted">You'll pay</p>
            <p className="text-numeral mt-1 text-fg">
              {formatNaira(quote.perInstallment)}
              <span className="ml-1.5 text-body font-normal tracking-normal text-fg-muted">{perLabel}</span>
            </p>
          </div>
          <dl className="mt-4">
            <Row label="Loan amount">{formatNaira(Math.min(Math.max(amount, LOAN_MIN), LOAN_MAX))}</Row>
            <Row label={`Interest (${MONTHLY_RATE * 100}% a month, flat)`}>{formatNaira(quote.interest)}</Row>
            <Row label="Fees">Shown in your offer</Row>
            <Row label={`Total over ${durationMonths} months`} strong>
              {formatNaira(quote.total)}
            </Row>
          </dl>
          <p className="mt-3 text-caption text-fg-muted">Illustrative rate for this prototype. Your offer is confirmed after review.</p>
        </Card>
      </StepLayout>
    </form>
  );
}
