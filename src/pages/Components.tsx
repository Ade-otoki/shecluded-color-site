import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, Pencil, Sparkles, X } from "lucide-react";
import { Button } from "@app/components/ui/Button";
import { Field } from "@app/components/ui/Field";
import { Input, Select } from "@app/components/ui/Input";
import { CheckCard, Chips as ChipGroup, RadioCards } from "@app/components/ui/Choice";
import { Badge, ProgressBar, StatusChip, LOAN_STATUSES, type LoanStatus } from "@app/components/ui/Surface";
import { MobileProgress, SaveIndicator, StepRail, Toast } from "@app/components/flow/Shell";
import { UploadTile } from "@app/steps/DocumentsStep";
import { useApplication } from "@app/lib/store";
import { contrast, fmt } from "../data";
import { DoDont, PageHeader, PairingTable, Section, Specimen, Tabs, type PairSpec } from "../kit";

function A11y({ items }: { items: ReactNode[] }) {
  return (
    <div className="prose">
      <ul>
        {items.map((i, n) => (
          <li key={n}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function ComponentPage({
  eyebrow = "Components",
  title,
  intro,
  overview,
  pairs,
  a11y,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  overview: ReactNode;
  pairs: PairSpec[];
  a11y: ReactNode[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
      <Tabs
        tabs={[
          { id: "overview", label: "Overview", content: overview },
          {
            id: "color",
            label: "Color & contrast",
            content: (
              <Section title="Token pairings" intro="Every color pairing this component uses, measured with the same WCAG 2.1 formula as the token build.">
                <PairingTable pairs={pairs} />
              </Section>
            ),
          },
          { id: "a11y", label: "Accessibility", content: <Section title="Accessibility">{<A11y items={a11y} />}</Section> },
        ]}
      />
    </>
  );
}

const label = (t: string) => (
  <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
    {t}
  </span>
);
const arrow = <ArrowRight aria-hidden className="size-4" />;

/* ---------------- Buttons ---------------- */
export function Buttons() {
  return (
    <ComponentPage
      title="Buttons"
      intro="Four variants with fixed jobs. Ink moves the applicant forward; brand pink commits once per flow; outline is secondary; ghost is tertiary."
      overview={
        <>
          <Specimen label={label("Medium · 48px touch target")}>
            <div className="flex flex-wrap items-center gap-3">
              <Button iconRight={arrow}>Continue</Button>
              <Button variant="brand">Submit application</Button>
              <Button variant="outline">Save and exit</Button>
              <Button variant="ghost" iconLeft={<ArrowLeft aria-hidden className="size-4" />}>
                Back
              </Button>
              <Button disabled>Uploading…</Button>
            </div>
          </Specimen>
          <Specimen label={label("Small · 36px for headers and inline actions")}>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Try again</Button>
              <Button size="sm" variant="outline" iconRight={<X aria-hidden className="size-4" />}>
                Save and exit
              </Button>
              <Button size="sm" variant="ghost" iconLeft={<Pencil aria-hidden className="size-3.5" />}>
                Edit
              </Button>
            </div>
          </Specimen>
          <Section title="Usage">
            <div className="grid-2">
              <DoDont kind="do" title="One brand button per flow" stage={<><Button variant="ghost">Back</Button><Button variant="brand">Submit application</Button></>}>
                Pink marks the moment that commits. Every other forward step uses ink, so the commit stands out.
              </DoDont>
              <DoDont
                kind="dont"
                title="White on brand pink"
                stage={
                  <button type="button" className="h-12 rounded-[10px] px-5 font-medium" style={{ background: "#EB2590", color: "#FFFFFF" }}>
                    Continue
                  </button>
                }
              >
                White labels on #EB2590 measure {fmt(contrast("#FFFFFF", "#EB2590"))}. Use action/primary (#D2137A) when a pink button is needed.
              </DoDont>
            </div>
          </Section>
        </>
      }
      pairs={[
        ["text/on-action", "action/ink", "Ink label"],
        ["text/on-action", "action/ink-hover", "Ink label, hover"],
        ["text/on-action", "action/ink-pressed", "Ink label, pressed"],
        ["text/on-action", "action/primary", "Brand label"],
        ["text/on-action", "action/primary-hover", "Brand label, hover"],
        ["text/on-action", "action/primary-pressed", "Brand label, pressed"],
        ["text/primary", "surface/raised", "Outline and ghost label", 4.5],
        ["border/control", "surface/raised", "Outline boundary"],
        ["border/focus", "surface/page", "Focus ring"],
      ]}
      a11y={[
        "Native <button> elements; the label states the action (Continue to documents, Submit application).",
        "48px minimum height on touch screens; SM (36px) only where a 48px row isn't available.",
        "2px border/focus ring with a 2px offset on keyboard focus (3.84:1 on the page, 4.04:1 on white).",
        "Disabled buttons use action/disabled with text/disabled; WCAG exempts them, but they stay legible. Prefer explaining why an action isn't available.",
        "Loading sets aria-busy and keeps the button's width so the layout doesn't jump.",
      ]}
    />
  );
}

/* ---------------- Chips ---------------- */
export function Chips() {
  const [years, setYears] = useState<string>("3-5");
  const [term, setTerm] = useState<number>(9);
  return (
    <ComponentPage
      title="Chips"
      intro="Single-choice answers for short options such as ranges and loan terms. Choosing is faster than typing, and a range is often all the lender needs."
      overview={
        <>
          <Specimen label={label("Interactive")}>
            <div className="flex flex-col gap-6">
              <Field label="How long have you been trading?" as="group">
                <ChipGroup
                  name="demo-years"
                  value={years}
                  onChange={setYears}
                  options={[
                    { value: "lt1", label: "Under 1 year" },
                    { value: "1-2", label: "1–2 years" },
                    { value: "3-5", label: "3–5 years" },
                    { value: "5+", label: "Over 5 years" },
                  ]}
                />
              </Field>
              <Field label="Loan term" as="group" error="Choose a loan term">
                <ChipGroup name="demo-term" value={undefined} onChange={setTerm} invalid options={[3, 6, 9, 12].map((d) => ({ value: d, label: `${d} months` }))} />
              </Field>
              <p className="m-0 text-[14px] text-[var(--text-secondary)]">Selected term in the first example: {term} months</p>
            </div>
          </Specimen>
          <div className="grid-2">
            <DoDont kind="do" title="Show the check on the selected chip" stage={<ChipGroup name="dd1" value="b" onChange={() => {}} options={[{ value: "a", label: "Monthly" }, { value: "b", label: "Every 2 weeks" }]} />}>
              Selection is shown by fill, contrast and a check icon, never by fill color alone.
            </DoDont>
            <DoDont
              kind="dont"
              title="Pink fill with white text"
              stage={
                <span className="inline-flex h-11 items-center rounded-full px-4 text-[14px] font-medium" style={{ background: "#EB2590", color: "#FFFFFF" }}>
                  9 months
                </span>
              }
            >
              14px white text on #EB2590 fails at {fmt(contrast("#FFFFFF", "#EB2590"))}. Selected chips use ink.
            </DoDont>
          </div>
        </>
      }
      pairs={[
        ["text/on-action", "action/ink", "Selected chip label"],
        ["action/ink", "surface/raised", "Selected chip boundary"],
        ["text/primary", "surface/raised", "Unselected chip label", 4.5],
        ["border/control", "surface/page", "Unselected chip outline"],
        ["status/danger-solid", "surface/raised", "Error outline", 3],
        ["border/focus", "surface/page", "Focus ring"],
      ]}
      a11y={[
        "Each chip is a native radio input inside a labelled fieldset, so arrow keys move between options.",
        "44px tall: within touch-target guidance for phones.",
        "Error state adds a red outline and an error message with an icon below the group.",
      ]}
    />
  );
}

/* ---------------- Badges & status ---------------- */
export function Badges() {
  return (
    <ComponentPage
      title="Badges & status"
      intro="Small pills that label state. Loan status chips always pair a word with an icon; plain badges carry a word."
      overview={
        <>
          <Specimen white label={label("Loan status")}>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LOAN_STATUSES) as LoanStatus[]).map((s) => (
                <StatusChip key={s} status={s} />
              ))}
            </div>
          </Specimen>
          <Specimen white label={label("Badge tones")}>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">Suggested</Badge>
              <Badge tone="neutral">Recommended</Badge>
              <Badge tone="success">Uploaded</Badge>
              <Badge tone="warning">Pending</Badge>
              <Badge tone="danger">Interrupted</Badge>
              <Badge tone="info">In review</Badge>
            </div>
          </Specimen>
          <p className="muted" style={{ margin: 0 }}>
            See <a className="site-link" href="#status">Status without color</a> for the colorblind simulation.
          </p>
        </>
      }
      pairs={[
        ["status/warning-fg", "status/warning-bg", "Pending"],
        ["status/info-fg", "status/info-bg", "In review"],
        ["status/success-fg", "status/success-bg", "Approved, Paid, Uploaded"],
        ["status/brand-fg", "status/brand-bg", "Disbursed, Suggested"],
        ["status/danger-fg", "status/danger-bg", "Overdue, Interrupted"],
        ["status/neutral-fg", "status/neutral-bg", "Declined, Recommended"],
      ]}
      a11y={[
        "12px medium text on tinted pills; every pairing clears 4.5:1, so badges are readable as text, not just shapes.",
        "Status chips include an icon with a distinct shape per status (clock, scan, check, double check, banknote, alert, cross).",
        "Icons are aria-hidden; the word carries the meaning for screen readers.",
      ]}
    />
  );
}

/* ---------------- Text fields ---------------- */
export function Fields() {
  const [name, setName] = useState("Adaeze Fabrics");
  return (
    <ComponentPage
      title="Text fields"
      intro="Label above, control, then a hint or an error. Inputs sit on white with a border that reaches 3:1 on every light surface."
      overview={
        <>
          <Specimen label={label("States")}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Business name" hint="As customers or your bank know it">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Business name" hint="As customers or your bank know it">
                <Input placeholder="e.g. Adaeze Fabrics" />
              </Field>
              <Field label="CAC registration number" error="Enter your CAC number, for example RC 1234567 or BN 1234567">
                <Input defaultValue="1234" />
              </Field>
              <Field label="What does your business do?" hint="We use this to suggest loan options that fit">
                <Select defaultValue="fashion">
                  <option value="fashion">Fashion and tailoring</option>
                  <option value="retail">Retail and trading</option>
                </Select>
              </Field>
            </div>
          </Specimen>
          <Specimen label={label("Large · loan amount")}>
            <Field label="Loan amount" hint="Between ₦100,000 and ₦5,000,000" why="It helps us suggest an amount you can repay comfortably.">
              <Input prefix="₦" size="lg" defaultValue="1,500,000" inputMode="numeric" />
            </Field>
          </Specimen>
          <div className="grid-2">
            <DoDont kind="do" title="Placeholder on white only" stage={<div className="w-full max-w-[280px]"><Input placeholder="e.g. Adaeze Fabrics" /></div>}>
              text/placeholder measures 4.57:1 on white. On grey or pink surfaces it drops below 4.5.
            </DoDont>
            <DoDont
              kind="dont"
              title="Light grey borders"
              stage={<input aria-label="Example input with a faint border" className="h-12 w-full max-w-[280px] rounded-[8px] border px-3.5" style={{ borderColor: "#D7D1D4", background: "#FFFFFF" }} placeholder="Business name" />}
            >
              neutral.200 borders measure {fmt(contrast("#D7D1D4", "#FFFFFF"))} on white. Applicants can't find the field outdoors.
            </DoDont>
          </div>
        </>
      }
      pairs={[
        ["text/primary", "surface/raised", "Entered value", 4.5],
        ["text/placeholder", "surface/raised", "Placeholder"],
        ["text/secondary", "surface/page", "Hint below the field"],
        ["border/control", "surface/raised", "Input border"],
        ["border/focus", "surface/raised", "Focus ring"],
        ["status/danger-fg", "surface/raised", "Error message"],
        ["status/danger-solid", "surface/raised", "Error border", 3],
      ]}
      a11y={[
        "Visible <label> tied to the control; hints and errors are linked with aria-describedby.",
        "Errors set aria-invalid, appear with an icon and role=alert, and say how to fix the problem.",
        "Native <select> for pickers: the most reliable option on low-end phones and with screen readers.",
        "inputMode=numeric on the amount brings up the number pad.",
      ]}
    />
  );
}

/* ---------------- Selection cards ---------------- */
export function Selection() {
  const [purpose, setPurpose] = useState<string>("equipment");
  const [consent, setConsent] = useState(true);
  return (
    <ComponentPage
      title="Selection cards"
      intro="Radio cards for a choice that needs explaining (loan purpose, repayment method), and check cards for explicit consent."
      overview={
        <>
          <Specimen label={label("Radio cards · smart default marked Suggested")}>
            <RadioCards
              name="demo-purpose"
              columns={2}
              value={purpose}
              onChange={setPurpose}
              options={[
                { value: "inventory", label: "Buy stock", description: "Restock goods or raw materials" },
                { value: "equipment", label: "Buy equipment", description: "Machines, tools, a vehicle or a freezer", badge: <Badge tone="brand">Suggested</Badge> },
                { value: "working_capital", label: "Run the business", description: "Rent, salaries or paying suppliers" },
                { value: "expansion", label: "Grow or expand", description: "A new location, product or market" },
              ]}
            />
          </Specimen>
          <Specimen label={label("Check card · consent")}>
            <CheckCard checked={consent} onChange={setConsent} title="Repayment authorisation">
              If approved, I authorise Shecluded to collect ₦211,667 each month for 9 months, 9 payments in total.
            </CheckCard>
          </Specimen>
          <div className="grid-2">
            <DoDont kind="do" title="Pink-700 for pink text on the tint" stage={<span className="rounded-[10px] px-4 py-3 text-[14px] font-medium" style={{ background: "#FDE8F3", color: "#BB116D" }}>Suggested for fashion businesses</span>}>
              text/link-on-tint (#BB116D) measures {fmt(contrast("#BB116D", "#FDE8F3"))} on the selected card's tint.
            </DoDont>
            <DoDont kind="dont" title="Brand pink text on the tint" stage={<span className="rounded-[10px] px-4 py-3 text-[14px] font-medium" style={{ background: "#FDE8F3", color: "#EB2590" }}>Suggested for fashion businesses</span>}>
              #EB2590 on #FDE8F3 measures {fmt(contrast("#EB2590", "#FDE8F3"))}. It looks on-brand and fails AA.
            </DoDont>
          </div>
        </>
      }
      pairs={[
        ["text/primary", "surface/brand-tint", "Selected card title"],
        ["text/secondary", "surface/brand-tint", "Selected card description"],
        ["border/brand", "surface/brand-tint", "Selected card outline"],
        ["status/brand-fg", "status/brand-bg", "Suggested badge"],
        ["action/ink", "surface/raised", "Radio dot and checkbox, checked"],
        ["border/control", "surface/raised", "Radio and checkbox, unchecked"],
        ["text/secondary", "surface/raised", "Description on white"],
      ]}
      a11y={[
        "Native radio and checkbox inputs inside labels: the whole card is the hit area.",
        "Selection is shown by the ink control, the pink outline and the tint together.",
        "Consent cards are never pre-checked and spell out the amount and number of payments.",
      ]}
    />
  );
}

/* ---------------- Alerts & toasts ---------------- */
export function Feedback() {
  const [toast, setToast] = useState<string | null>("Progress saved. Come back anytime on this device.");
  return (
    <ComponentPage
      title="Alerts & toasts"
      intro="Inline alerts explain something on the page; the toast confirms an action that took the applicant elsewhere."
      overview={
        <>
          <Specimen label={label("Inline alerts")}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-brand-tint)] px-4 py-3.5">
                <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0 text-[var(--text-link-on-tint)]" />
                <p className="m-0 text-[14px]">
                  <span className="font-medium">We've pre-filled a few answers for fashion and tailoring.</span>{" "}
                  <span className="text-[var(--text-secondary)]">Change anything that doesn't fit.</span>
                </p>
              </div>
              <p role="alert" className="m-0 flex items-center gap-2 rounded-[10px] bg-[var(--status-danger-bg)] px-4 py-3 text-[14px] text-[var(--status-danger-fg)]">
                <CircleAlert aria-hidden className="size-4 shrink-0" /> Upload the documents marked below to continue. You can save and come back to it.
              </p>
            </div>
          </Specimen>
          <Specimen label={label("Toast and save indicator")}>
            <div className="relative h-36 overflow-hidden rounded-[12px] border border-dashed border-[var(--border-control)]" style={{ transform: "translateZ(0)" }}>
              <div className="p-4">
                <SaveIndicator />
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setToast("Progress saved. Come back anytime on this device.")}>
                    Show toast
                  </Button>
                </div>
              </div>
              <div className="[&>div]:!bottom-4">
                <Toast message={toast} onDone={() => setToast(null)} />
              </div>
            </div>
          </Specimen>
        </>
      }
      pairs={[
        ["text/primary", "surface/brand-tint", "Brand alert message"],
        ["text/secondary", "surface/brand-tint", "Brand alert detail"],
        ["status/danger-fg", "status/danger-bg", "Danger alert"],
        ["text/on-action", "action/ink", "Toast message"],
        ["status/success-fg", "surface/raised", "Saved icon"],
      ]}
      a11y={[
        "Toasts and the save indicator use polite live regions; blocking errors use role=alert.",
        "Toasts stay 3.2 seconds and never hold the only copy of important information.",
        "Alert icons repeat the tone's meaning but are hidden from screen readers; the text says it all.",
      ]}
    />
  );
}

/* ---------------- Progress & steps ---------------- */
function StepDemo() {
  const { app, go } = useApplication();
  const step = app.step === "start" || app.step === "submitted" ? "loan" : app.step;
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="force-rail">
        <StepRail current={step} />
      </div>
      <div className="flex flex-col gap-6">
        <div className="force-mobile rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
          <MobileProgress current={step} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["business", "loan", "documents", "review", "consent"] as const).map((s) => (
            <Button key={s} size="sm" variant={s === step ? "ink" : "outline"} onClick={() => go(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <ProgressBar value={42} label="Upload progress example" />
          <ProgressBar value={55} tone="danger" label="Interrupted upload example" />
          <ProgressBar value={100} tone="success" label="Completed upload example" />
        </div>
      </div>
    </div>
  );
}

export function Progress() {
  return (
    <ComponentPage
      title="Progress & steps"
      intro="Every step shows where the applicant is, the step name and modeled minutes left. Desktop uses a step rail; phones use a five-segment bar."
      overview={
        <Specimen label={label("Step rail and mobile progress · switch steps to see both update")}>
          <StepDemo />
        </Specimen>
      }
      pairs={[
        ["action/ink", "surface/raised", "Current and completed step markers"],
        ["text/primary", "surface/page", "Current step name"],
        ["text/secondary", "surface/page", "Upcoming step names, time left"],
        ["border/control", "surface/page", "Upcoming step marker"],
        ["border/brand", "surface/subtle", "Progress fill on its track", 3],
        ["status/danger-solid", "surface/subtle", "Interrupted upload fill", 3],
      ]}
      a11y={[
        "The rail is a <nav> with aria-current=step on the active item; completed steps are buttons for editing.",
        "Progress bars expose role=progressbar with a value and a label.",
        "Progress is shown in words (Step 2 of 5 · about 5 min left), not only as a filled bar.",
      ]}
    />
  );
}

/* ---------------- Upload ---------------- */
function UploadDemo() {
  const { weakNetwork, setWeakNetwork } = useApplication();
  return (
    <div className="flex flex-col gap-4">
      <label className="flex w-fit cursor-pointer items-center gap-3 text-[14px] font-medium">
        <input type="checkbox" checked={weakNetwork} onChange={(e) => setWeakNetwork(e.target.checked)} className="size-4 accent-[var(--action-ink)]" />
        Simulate a weak connection (the next upload stops at 55%)
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <UploadTile docKey="id" missing={false} />
        <UploadTile docKey="statement" missing={false} />
      </div>
    </div>
  );
}

export function Upload() {
  return (
    <ComponentPage
      title="Document upload"
      intro="The live component from the loan application. Choose any PDF, JPG or PNG to see the upload states; turn on the weak connection to see the interruption and resume."
      overview={
        <>
          <Specimen label={label("Live · try a file")}>
            <UploadDemo />
          </Specimen>
          <Section title="States">
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Badge</th>
                    <th>What the applicant can do</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Empty", <Badge tone="neutral">Required</Badge>, "Choose a file or take a photo"],
                    ["Uploading", <Badge tone="neutral">Uploading</Badge>, "Cancel"],
                    ["Interrupted", <Badge tone="danger">Interrupted</Badge>, "Try again: resumes from where it stopped"],
                    ["Invalid", <Badge tone="danger">Can't use this file</Badge>, "Choose another file"],
                    ["Done", <Badge tone="success">Uploaded</Badge>, "Remove"],
                  ].map(([s, b, d]) => (
                    <tr key={s as string}>
                      <td className="font-medium">{s}</td>
                      <td style={{ colorScheme: "light" }}>{b}</td>
                      <td className="muted">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      }
      pairs={[
        ["status/danger-fg", "status/danger-bg", "Interruption message"],
        ["status/danger-solid", "status/danger-bg", "Interrupted tile border"],
        ["status/success-fg", "status/success-bg", "Uploaded icon tile"],
        ["border/control", "surface/subtle", "Dropzone dashed outline"],
        ["text/primary", "surface/subtle", "Dropzone prompt", 4.5],
        ["text/secondary", "surface/raised", "File size and tip"],
      ]}
      a11y={[
        "The dropzone is a button that opens the native file picker; drag and drop is an extra, not the only way.",
        "Errors say what happened and what to do: 'Your connection dropped at 55%. Try again and we'll continue from there.'",
        "Status is shown with a word, an icon and color (Interrupted with a no-signal icon, Uploaded with a check).",
      ]}
    />
  );
}
