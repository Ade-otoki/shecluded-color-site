import { ArrowLeft, ArrowRight, CircleCheck, Pencil } from "lucide-react";
import {
  CATEGORIES,
  EMPLOYEES,
  FREQUENCIES,
  ID_TYPES,
  PURPOSES,
  REPAYMENT_METHODS,
  REVENUE,
  YEARS,
  formatNaira,
  labelOf,
  repayment,
  requiredDocs,
  type Loan,
  type StepId,
} from "../lib/application";
import { useApplication } from "../lib/store";
import { StepLayout } from "../components/flow/Shell";
import { Card, Row } from "../components/ui/Surface";
import { Button } from "../components/ui/Button";

const DOC_LABEL = { id: "Government ID", statement: "Bank statement", cac: "CAC certificate" } as const;

export function ReviewStep() {
  const { app, go, setReturnTo } = useApplication();
  const b = app.business;
  const loan = app.loan as Loan;
  const quote = repayment(loan);

  const edit = (step: StepId) => (
    <Button
      variant="ghost"
      size="sm"
      iconLeft={<Pencil aria-hidden className="size-3.5" />}
      onClick={() => {
        setReturnTo("review");
        go(step);
      }}
    >
      Edit
    </Button>
  );

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        go("consent");
      }}
    >
      <StepLayout
        step="review"
        title="Check your answers"
        description="Make sure everything is right. You can edit any section before you agree and submit."
        onBack={() => go("documents")}
        actions={
          <>
            <Button variant="ghost" iconLeft={<ArrowLeft aria-hidden className="size-4" />} onClick={() => go("documents")}>
              Back
            </Button>
            <Button type="submit" iconRight={<ArrowRight aria-hidden className="size-4" />} className="max-lg:flex-1">
              Looks right, continue
            </Button>
          </>
        }
      >
        <Card eyebrow="Your loan" action={edit("loan")}>
          <p className="text-small text-fg-muted">You're asking for</p>
          <p className="text-numeral mt-1 text-fg">{formatNaira(loan.amount)}</p>
          <dl className="mt-3">
            <Row label="For">{labelOf(PURPOSES, loan.purpose)}</Row>
            <Row label="Term">{loan.durationMonths} months</Row>
            <Row label="Payments">
              {quote.installments} × {formatNaira(quote.perInstallment)} {labelOf(FREQUENCIES, loan.frequency).toLowerCase()}
            </Row>
            <Row label="Repay by">{labelOf(REPAYMENT_METHODS, loan.repaymentMethod)}</Row>
            <Row label="Total to repay" strong>
              {formatNaira(quote.total)}
            </Row>
          </dl>
        </Card>

        <Card eyebrow="Your business" action={edit("business")}>
          <dl>
            <Row label="Name">{b.businessName}</Row>
            <Row label="Category">{labelOf(CATEGORIES, b.category)}</Row>
            <Row label="Address">
              {b.address}, {b.state}
            </Row>
            <Row label="Trading for">{labelOf(YEARS, b.years)}</Row>
            <Row label="CAC">{b.registered === "yes" ? b.registrationNumber?.toUpperCase() : "Not registered"}</Row>
            <Row label="Monthly revenue">{labelOf(REVENUE, b.revenue)}</Row>
            <Row label="Team">{labelOf(EMPLOYEES, b.employees)}</Row>
          </dl>
        </Card>

        <Card eyebrow="Documents" action={edit("documents")}>
          <ul className="flex flex-col">
            {requiredDocs(b).map((k) => {
              const f = app.documents.files[k];
              return (
                <li key={k} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
                  <CircleCheck aria-hidden className="size-5 shrink-0 text-success-fg" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-small font-medium text-fg">
                      {DOC_LABEL[k]}
                      {k === "id" && ` · ${labelOf(ID_TYPES, app.documents.idType)}`}
                    </span>
                    <span className="truncate text-caption text-fg-muted">{f?.name}</span>
                  </span>
                  <span className="sr-only">Uploaded</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </StepLayout>
    </form>
  );
}
