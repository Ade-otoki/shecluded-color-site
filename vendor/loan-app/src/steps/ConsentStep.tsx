import { useState } from "react";
import { ArrowLeft, CircleAlert, ShieldCheck } from "lucide-react";
import { formatNaira, repayment, type Loan } from "../lib/application";
import { useApplication } from "../lib/store";
import { StepLayout } from "../components/flow/Shell";
import { CheckCard } from "../components/ui/Choice";
import { Button } from "../components/ui/Button";

export function ConsentStep() {
  const { app, go, updateConsent, submit } = useApplication();
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loan = app.loan as Loan;
  const quote = repayment(loan);
  const c = app.consent;
  const all = c.verify && c.terms && c.repayment;
  const each = loan.frequency === "monthly" ? "each month" : "every two weeks";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        if (!all) return;
        setSubmitting(true);
        window.setTimeout(submit, 900);
      }}
    >
      <StepLayout
        step="consent"
        title="Agree and submit"
        description="Three things we need your permission for. Each one says exactly what you're agreeing to."
        onBack={() => go("review")}
        actions={
          <>
            <Button variant="ghost" aria-label="Back" iconLeft={<ArrowLeft aria-hidden className="size-4" />} onClick={() => go("review")}>
              <span className="max-sm:sr-only">Back</span>
            </Button>
            <Button type="submit" variant="brand" loading={submitting} className="max-lg:flex-1">
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-3 divide-x divide-line rounded-md border border-line bg-raised max-[400px]:grid-cols-1 max-[400px]:divide-x-0 max-[400px]:divide-y">
          {[
            ["Amount", formatNaira(loan.amount)],
            [loan.frequency === "monthly" ? "Monthly" : "Every 2 weeks", formatNaira(quote.perInstallment)],
            ["Term", `${loan.durationMonths} months`],
          ].map(([k, v]) => (
            <div key={k} className="px-3 py-3 sm:px-4 max-[400px]:flex max-[400px]:items-baseline max-[400px]:justify-between max-[400px]:gap-3 max-[400px]:py-2.5">
              <p className="text-caption text-fg-muted">{k}</p>
              <p className="mt-0.5 font-semibold text-fg tabular max-[400px]:mt-0">{v}</p>
            </div>
          ))}
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Consent</legend>
          <CheckCard checked={c.verify} onChange={(v) => updateConsent({ verify: v })} title="Verify my information">
            I allow Shecluded to check my identity, BVN and business details with credit bureaus and verification partners.
          </CheckCard>
          <CheckCard checked={c.terms} onChange={(v) => updateConsent({ terms: v })} title="Loan terms">
            I've read the loan terms, including the interest, fees and repayment schedule.{" "}
            <a href="#terms" className="font-medium text-fg-link underline underline-offset-4" onClick={(e) => e.stopPropagation()}>
              Read the full terms
            </a>
          </CheckCard>
          <CheckCard checked={c.repayment} onChange={(v) => updateConsent({ repayment: v })} title="Repayment authorisation">
            If approved, I authorise Shecluded to collect {formatNaira(quote.perInstallment)} {each} for {loan.durationMonths} months, {quote.installments} payments in
            total.
          </CheckCard>
        </fieldset>

        {attempted && !all && (
          <p role="alert" className="flex items-center gap-2 rounded-md bg-danger-bg px-4 py-3 text-small text-danger-fg">
            <CircleAlert aria-hidden className="size-4 shrink-0" /> Tick all three boxes to submit your application.
          </p>
        )}

        <p className="flex items-start gap-2 text-small text-fg-muted">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
          Submitting doesn't commit you to a loan. You'll see your final offer and can still say no.
        </p>
      </StepLayout>
    </form>
  );
}
