import { Check } from "lucide-react";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { formatNaira, repayment, type Loan } from "../lib/application";
import { useApplication } from "../lib/store";
import { AppHeader } from "../components/flow/Shell";
import { Card, Eyebrow, Row } from "../components/ui/Surface";
import { Button } from "../components/ui/Button";

const TIMELINE = [
  { title: "Application submitted", note: "Today", state: "done" },
  { title: "We review your application", note: "We may call to ask a question", state: "current" },
  { title: "You get a decision and offer", note: "By SMS and email", state: "upcoming" },
  { title: "Money in your account", note: "After you accept the offer", state: "upcoming" },
] as const;

export function SubmittedScreen() {
  const { app, reset } = useApplication();
  const reduce = useReducedMotion();
  const loan = app.loan as Loan;
  const quote = repayment(loan);

  return (
    <>
      <AppHeader showSave={false} />
      <main className="mx-auto flex max-w-[var(--layout-content-max)] flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:pt-20">
        <div>
          <motion.span
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="grid size-12 place-items-center rounded-full bg-success-bg text-success-fg"
          >
            <Check aria-hidden className="size-6" strokeWidth={2.5} />
          </motion.span>
          <Eyebrow className="mt-6">Reference {app.reference}</Eyebrow>
          <h1 className="text-display mt-2 text-fg max-sm:text-[36px] max-sm:leading-[40px]">Application sent.</h1>
          <p className="mt-3 text-fg-muted">
            Thank you{app.business.businessName ? `, ${app.business.businessName}` : ""}. We'll be in touch by SMS and email. Keep your reference handy if you contact us.
          </p>
        </div>

        <Card eyebrow="What happens next">
          <ol>
            {TIMELINE.map((t, i) => (
              <li key={t.title} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < TIMELINE.length - 1 && <span aria-hidden className={clsx("absolute left-[11.5px] top-7 h-[calc(100%-24px)] w-px", t.state === "done" ? "bg-ink" : "bg-line")} />}
                <span
                  aria-hidden
                  className={clsx(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border",
                    t.state === "done" && "border-ink bg-ink text-fg-on-action",
                    t.state === "current" && "border-brand-mark bg-brand-tint",
                    t.state === "upcoming" && "border-line-control bg-raised",
                  )}
                >
                  {t.state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : t.state === "current" ? <span className="size-2 rounded-full bg-brand-mark" /> : null}
                </span>
                <span>
                  <span className={clsx("block font-medium", t.state === "upcoming" ? "text-fg-muted" : "text-fg")}>{t.title}</span>
                  <span className="text-small text-fg-muted">{t.note}</span>
                  <span className="sr-only"> ({t.state === "done" ? "complete" : t.state === "current" ? "in progress" : "not started"})</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <Card eyebrow="Your request">
          <dl>
            <Row label="Amount">{formatNaira(loan.amount)}</Row>
            <Row label="Repayments">
              {quote.installments} × {formatNaira(quote.perInstallment)}
            </Row>
            <Row label="Total to repay" strong>
              {formatNaira(quote.total)}
            </Row>
          </dl>
        </Card>

        <Button variant="outline" block onClick={reset}>
          Back to start
        </Button>
      </main>
    </>
  );
}
