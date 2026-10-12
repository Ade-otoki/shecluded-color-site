import { useState, type ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@app/components/ui/Button";
import { Field } from "@app/components/ui/Field";
import { Input } from "@app/components/ui/Input";
import { RadioCards } from "@app/components/ui/Choice";
import { Badge, Card, Row, StatusChip } from "@app/components/ui/Surface";
import { contrast, fmt, pairing, tokenHex } from "../data";
import { PageHeader, Section, Specimen, Verdict } from "../kit";

const BRAND = "#EB2590";

export function BeforeAfter() {
  const surfaces = [
    { name: "White card", token: "surface/raised", hex: tokenHex("surface/raised") },
    { name: "Light pink card", token: "surface/brand-tint", hex: tokenHex("surface/brand-tint") },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Before & after"
        intro="The visual difference is small. The readability difference crosses the AA line. Same button and link, in the original brand pink and in the accessible system."
      />
      {surfaces.map((s) => {
        const afterLink = s.token === "surface/brand-tint" ? "text/link-on-tint" : "text/link";
        return (
          <Section key={s.token} title={`On the ${s.name.toLowerCase()}`} intro={<code className="tok">{s.token} · {s.hex}</code>}>
            <div className="grid-2">
              <div className="flex flex-col gap-3">
                <span className="eyebrow">Before · {BRAND} everywhere</span>
                <div className="rounded-[16px] border border-[var(--site-line)] p-6" style={{ background: s.hex, colorScheme: "light" }}>
                  <div className="flex flex-col gap-4">
                    <button type="button" className="h-12 w-fit rounded-[10px] px-5 font-medium" style={{ background: BRAND, color: "#FFFFFF" }}>
                      Repay loan
                    </button>
                    <a href="#before-after" className="w-fit font-medium underline underline-offset-4" style={{ color: BRAND }}>
                      View repayment schedule
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Verdict ratio={contrast("#FFFFFF", BRAND)} min={4.5} />
                  <Verdict ratio={contrast(BRAND, s.hex)} min={4.5} />
                </div>
                <p className="muted m-0 text-[14px]">Button label, then link. Both fail AA for normal text.</p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="eyebrow">After · each shade has a job</span>
                <div className="rounded-[16px] border border-[var(--site-line)] p-6" style={{ background: s.hex, colorScheme: "light" }}>
                  <div className="flex flex-col gap-4">
                    <Button variant="brand" className="w-fit">
                      Repay loan
                    </Button>
                    <a href="#before-after" className="w-fit font-medium underline underline-offset-4" style={{ color: `var(--${afterLink.replace("/", "-")})` }}>
                      View repayment schedule
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Verdict ratio={pairing("text/on-action", "action/primary").ratio} min={4.5} />
                  <Verdict ratio={pairing(afterLink, s.token).ratio} min={4.5} />
                </div>
                <p className="muted m-0 text-[14px]">
                  <code className="tok">action/primary</code> and <code className="tok">{afterLink}</code>.
                </p>
              </div>
            </div>
          </Section>
        );
      })}
      <Section title="How the loan application goes further" intro="Forward actions use ink, so pink is reserved for the one button that commits.">
        <Specimen>
          <div className="flex flex-wrap items-center gap-3">
            <Button iconRight={<ArrowRight aria-hidden className="size-4" />}>Continue to documents</Button>
            <Verdict ratio={pairing("text/on-action", "action/ink").ratio} min={4.5} />
            <Button variant="brand">Submit application</Button>
            <Verdict ratio={pairing("text/on-action", "action/primary").ratio} min={4.5} />
          </div>
        </Specimen>
      </Section>
    </>
  );
}

function Marker({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span
        aria-hidden
        className="absolute -right-2.5 -top-2.5 grid size-6 place-items-center rounded-full text-[12px] font-semibold tnum"
        style={{ background: "#1F1B1D", color: "#FFFFFF", boxShadow: "0 0 0 2px #FFFFFF" }}
      >
        {n}
      </span>
    </div>
  );
}

const NOTES: { n: number; what: string; fg: string; bg: string; min?: number }[] = [
  { n: 1, what: "Smart-default banner text", fg: "text/primary", bg: "surface/brand-tint" },
  { n: 2, what: "Amount input border", fg: "border/control", bg: "surface/raised" },
  { n: 3, what: "Hint under the field", fg: "text/secondary", bg: "surface/raised" },
  { n: 4, what: "Selected purpose outline", fg: "border/brand", bg: "surface/brand-tint" },
  { n: 5, what: "Suggested badge", fg: "status/brand-fg", bg: "status/brand-bg" },
  { n: 6, what: "Repayment total", fg: "text/primary", bg: "surface/raised", min: 4.5 },
  { n: 7, what: "Loan status chip", fg: "status/info-fg", bg: "status/info-bg" },
  { n: 8, what: "Continue button label", fg: "text/on-action", bg: "action/ink" },
];

export function Annotated() {
  const [purpose, setPurpose] = useState("equipment");
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Annotated screen"
        intro="The loan step of the application, built from the live components. Each numbered pairing shows its token and measured contrast."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
        <Specimen>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-eyebrow text-[var(--text-secondary)]">Step 2 of 5</p>
              <h2 className="text-h1 mt-2">How much do you need?</h2>
            </div>
            <Marker n={1}>
              <div className="flex items-start gap-3 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-brand-tint)] px-4 py-3.5">
                <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0 text-[var(--text-link-on-tint)]" />
                <p className="m-0 text-[14px] font-medium">We've pre-filled a few answers for fashion and tailoring.</p>
              </div>
            </Marker>
            <Card eyebrow="Amount">
              <Marker n={3}>
                <Field label="Loan amount" hint="Between ₦100,000 and ₦5,000,000">
                  <Marker n={2}>
                    <Input prefix="₦" size="lg" defaultValue="1,500,000" />
                  </Marker>
                </Field>
              </Marker>
            </Card>
            <Card eyebrow="What it's for">
              <Marker n={4}>
                <RadioCards
                  name="annotated-purpose"
                  value={purpose}
                  onChange={setPurpose}
                  options={[
                    { value: "equipment", label: "Buy equipment", description: "Machines, tools, a vehicle or a freezer", badge: <Marker n={5}><Badge tone="brand">Suggested</Badge></Marker> },
                    { value: "inventory", label: "Buy stock", description: "Restock goods or raw materials" },
                  ]}
                />
              </Marker>
            </Card>
            <Card eyebrow="Your repayment" emphasis>
              <Marker n={6}>
                <dl className="m-0">
                  <Row label="Loan amount">₦1,500,000</Row>
                  <Row label="Total over 9 months" strong>
                    ₦1,905,000
                  </Row>
                </dl>
              </Marker>
            </Card>
            <div className="flex items-center justify-between gap-3">
              <Marker n={7}>
                <StatusChip status="in_review" />
              </Marker>
              <Marker n={8}>
                <Button iconRight={<ArrowRight aria-hidden className="size-4" />}>Continue to documents</Button>
              </Marker>
            </div>
          </div>
        </Specimen>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {NOTES.map((a) => {
            const p = pairing(a.fg, a.bg, a.what, a.min);
            return (
              <li key={a.n} className="panel flex gap-4" style={{ padding: 16 }}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold tnum" style={{ background: "var(--site-fg)", color: "var(--site-bg)" }}>
                  {a.n}
                </span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-medium">{a.what}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <code className="tok">{a.fg}</code>
                    <span className="muted text-[13px]">on</span>
                    <code className="tok">{a.bg}</code>
                  </span>
                  <span>
                    <Verdict ratio={p.ratio} min={p.min} />
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

const FLOW: { prim: string[]; sem: string[]; comps: string }[] = [
  { prim: ["pink.600", "pink.700", "pink.800"], sem: ["action/primary", "action/primary-hover", "action/primary-pressed"], comps: "Button · brand (Submit application)" },
  { prim: ["pink.600"], sem: ["text/link"], comps: "Links on white" },
  { prim: ["pink.700"], sem: ["text/link-on-tint", "status/brand-fg"], comps: "Suggested badge, Disbursed chip, smart-default banner icon" },
  { prim: ["pink.500"], sem: ["border/brand", "border/focus", "icon/brand"], comps: "Selected radio card, focus ring, progress fill, logo mark" },
  { prim: ["pink.50"], sem: ["surface/brand-tint", "status/brand-bg"], comps: "Selected radio card, smart-default banner" },
  { prim: ["neutral.900", "neutral.800", "neutral.700"], sem: ["action/ink", "text/primary"], comps: "Button · ink, selected chip, radio dot, toast, body text" },
  { prim: ["neutral.600"], sem: ["text/secondary"], comps: "Hints, descriptions, step names" },
  { prim: ["neutral.500"], sem: ["border/control", "text/placeholder"], comps: "Input, select, chip outline, unchecked controls" },
  { prim: ["neutral.0", "neutral.25", "neutral.50"], sem: ["surface/raised", "surface/page", "surface/subtle", "text/on-action"], comps: "Cards, inputs, page, dropzone, button labels" },
  { prim: ["green", "amber", "red", "blue"], sem: ["status/*-bg", "status/*-fg", "status/*-solid"], comps: "Status chip, upload tile, alerts, field errors" },
];

export function Architecture() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="System architecture"
        intro="Primitive tones feed semantic tokens; components consume only semantic tokens. Engineers and future designers pick the right pink without re-measuring."
      />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Primitive tones</th>
              <th aria-hidden />
              <th>Semantic tokens</th>
              <th aria-hidden />
              <th>Components</th>
            </tr>
          </thead>
          <tbody>
            {FLOW.map((f) => (
              <tr key={f.comps}>
                <td>
                  <span className="flex flex-wrap gap-1.5">
                    {f.prim.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1.5">
                        {p.includes(".") && (
                          <span
                            className="inline-block size-4 rounded-[4px] border border-[var(--site-line)]"
                            style={{ background: tokenHex(SEMANTIC_BY_PRIM[p] ?? "") }}
                            aria-hidden
                          />
                        )}
                        <code className="tok">{p}</code>
                      </span>
                    ))}
                  </span>
                </td>
                <td aria-hidden className="muted">
                  →
                </td>
                <td>
                  <span className="flex flex-wrap gap-1.5">
                    {f.sem.map((s) => (
                      <code key={s} className="tok">
                        {s}
                      </code>
                    ))}
                  </span>
                </td>
                <td aria-hidden className="muted">
                  →
                </td>
                <td style={{ minWidth: 220 }}>{f.comps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Section title="Why two layers" intro="If the brand pink ever changes, one primitive changes and the build re-measures every pairing. Components never change.">
        <div className="grid-3">
          {[
            ["Designers", "Pick from Color variables in Figma. Primitives are hidden from publishing, so the wrong pink can't be chosen."],
            ["Engineers", "Write the same names as CSS variables or Tailwind classes. WEB code syntax on each Figma variable shows the exact name."],
            ["The build", `Fails if any of the documented pairings drops below its threshold. Brand pink on white stays at ${fmt(contrast(BRAND, "#FFFFFF"))}, flagged.`],
          ].map(([t, d]) => (
            <div key={t} className="panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 className="h3">{t}</h3>
              <p className="muted m-0 text-[15px] leading-6">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// A semantic token that resolves to each primitive, used only to paint the swatch dot.
const SEMANTIC_BY_PRIM: Record<string, string> = {
  "pink.600": "action/primary",
  "pink.700": "action/primary-hover",
  "pink.800": "action/primary-pressed",
  "pink.500": "border/brand",
  "pink.50": "surface/brand-tint",
  "neutral.900": "action/ink",
  "neutral.800": "action/ink-hover",
  "neutral.700": "action/ink-pressed",
  "neutral.600": "text/secondary",
  "neutral.500": "border/control",
  "neutral.0": "surface/raised",
  "neutral.25": "surface/page",
  "neutral.50": "surface/subtle",
};
