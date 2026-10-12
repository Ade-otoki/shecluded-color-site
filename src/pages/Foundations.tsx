import { useMemo, useState } from "react";
import { Circle } from "lucide-react";
import { LOAN_STATUSES, StatusChip, type LoanStatus } from "@app/components/ui/Surface";
import { FORBIDDEN, PAIRINGS, ROLE_COPY, ROLE_ORDER, SCALE, SEMANTIC, contrast, cssVar, fmt, level, pairing, thresholdLabel, tokenHex } from "../data";
import { PageHeader, PairingTable, Section, SimulationPicker, Specimen, Verdict, simStyle, type SimId } from "../kit";

const FAMILY_COPY: Record<string, string> = {
  pink: "The brand hue. Generated from #EB2590 by changing lightness only, so every step reads as the same pink.",
  neutral: "Warm greys biased toward the pink. neutral.500 is the lightest grey that passes 3:1 as a control border on every light surface.",
  green: "Success: approved and paid states, upload complete.",
  amber: "Warning and the yellow eligibility card. amber.900 replaces the old amber-on-yellow text.",
  red: "Danger: overdue, failed uploads, validation errors.",
  blue: "Information: in review.",
};

export function ColorScale() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations · Color"
        title="Tonal scale"
        intro="Six families of primitive tones, each step measured against white and black. Primitives are raw material: components never use them directly."
      />
      {Object.entries(SCALE).map(([family, steps]) => (
        <Section key={family} title={family[0].toUpperCase() + family.slice(1)} intro={FAMILY_COPY[family]}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Swatch</th>
                  <th>Step</th>
                  <th>Hex</th>
                  <th>With white text</th>
                  <th>With black text</th>
                  <th>Job</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s) => (
                  <tr key={s.step} style={family === "pink" && s.step === "500" ? { background: "var(--site-accent-tint)" } : undefined}>
                    <td>
                      <span className="inline-block h-9 w-16 rounded-[8px] border border-[var(--site-line)]" style={{ background: s.hex }} aria-hidden />
                    </td>
                    <td className="tnum">
                      <code className="tok">
                        {family}.{s.step}
                      </code>
                    </td>
                    <td className="mono tnum">{s.hex}</td>
                    <td>
                      <Verdict ratio={s.white} />
                    </td>
                    <td>
                      <Verdict ratio={s.black} />
                    </td>
                    <td className="muted" style={{ minWidth: 220 }}>
                      {s.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
    </>
  );
}

export function ColorRoles() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations · Color"
        title="Color roles"
        intro="Semantic tokens name a job and alias one primitive. Pick these, never a hex. The swatch shows the token's measured contrast against the surface it is meant for."
      />
      {ROLE_ORDER.map((role) => (
        <Section key={role} title={role[0].toUpperCase() + role.slice(1)} intro={ROLE_COPY[role]}>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {SEMANTIC.filter((t) => t.name.startsWith(role + "/")).map((t) => {
              const p = PAIRINGS.find((x) => x.fg === t.name || x.bg === t.name);
              const onDark = contrast("#FFFFFF", t.hex) > contrast("#1F1B1D", t.hex);
              return (
                <div key={t.name} className="swatch">
                  <div className="swatch-chip" style={{ background: t.hex, color: onDark ? "#FFFFFF" : "#1F1B1D" }}>
                    <span>{t.name.split("/")[1]}</span>
                    <span className="mono" style={{ fontWeight: 500 }}>
                      {t.hex}
                    </span>
                  </div>
                  <div className="swatch-meta">
                    <code className="tok" style={{ width: "fit-content" }}>
                      {t.name}
                    </code>
                    <span className="muted">→ {t.ref}</span>
                    <span>{t.use}</span>
                    {p && (
                      <span className="flex flex-wrap items-center gap-2 pt-1">
                        <Verdict ratio={p.ratio} min={p.min} />
                        <span className="muted" style={{ fontSize: 12 }}>
                          {p.fg === t.name ? `on ${p.bg}` : `under ${p.fg}`}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      ))}
    </>
  );
}

const TOKEN_NAMES = SEMANTIC.map((t) => t.name);

export function Pairings() {
  const [fg, setFg] = useState("text/link");
  const [bg, setBg] = useState("surface/brand-tint");
  const [filter, setFilter] = useState<"all" | 7 | 4.5 | 3>("all");
  const ratio = contrast(tokenHex(fg), tokenHex(bg));
  const allowed = PAIRINGS.find((p) => p.fg === fg && p.bg === bg);
  const forbidden = FORBIDDEN.find((p) => p.fgHex === tokenHex(fg) && p.bgHex === tokenHex(bg));
  const rows = useMemo(() => PAIRINGS.filter((p) => filter === "all" || p.min === filter), [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Foundations · Color"
        title="Contrast pairings"
        intro={`Every foreground and background the system allows, with the WCAG 2.1 threshold it must meet. ${PAIRINGS.filter((p) => p.pass).length} of ${PAIRINGS.length} pass; the build fails if one drops.`}
      />

      <Section title="Check a pairing" intro="Choose any two semantic tokens. The ratio uses the same WCAG 2.1 formula as the token build.">
        <div className="panel" style={{ padding: 24, display: "grid", gap: 24 }}>
          <div className="grid-2">
            {[
              ["checker-fg", "Foreground", fg, setFg],
              ["checker-bg", "Background", bg, setBg],
            ].map(([id, label, value, set]) => (
              <label key={id as string} htmlFor={id as string} className="flex flex-col gap-2 text-[14px] font-medium">
                {label as string}
                <select
                  id={id as string}
                  value={value as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  className="focus-ring h-11 rounded-[8px] border px-3"
                  style={{ borderColor: "var(--site-line)", background: "var(--site-surface)", color: "var(--site-fg)" }}
                >
                  {TOKEN_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n} · {tokenHex(n)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="rounded-[12px] border border-[var(--site-line)] p-6" style={{ background: cssVar(bg), color: cssVar(fg), colorScheme: "light" }}>
              <p style={{ margin: 0, fontSize: 28, lineHeight: "34px", fontFamily: "var(--font-site-display)" }}>Funding for the business you're building.</p>
              <p style={{ margin: "8px 0 0", fontSize: 16 }}>Continue to your loan · ₦211,667 per month</p>
              <span className="mt-4 inline-block h-11 w-40 rounded-[10px] border-2" style={{ borderColor: cssVar(fg) }} aria-hidden />
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <p className="tnum" style={{ margin: 0, fontFamily: "var(--font-site-display)", fontSize: 56, lineHeight: 1 }} aria-live="polite">
                {fmt(ratio)}
              </p>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Verdict ratio={ratio} min={4.5} />
                <Verdict ratio={ratio} min={3} />
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                {allowed
                  ? `Allowed pairing: ${allowed.where} (needs ${thresholdLabel(allowed.min)}).`
                  : forbidden
                    ? `Forbidden: ${forbidden.why}`
                    : `Not a documented pairing. ${level(ratio).label === "Fails" ? "Don't use it." : "Add it to tokens/source.json before shipping."}`}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Allowed pairings">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by threshold">
          {(
            [
              ["all", "All"],
              [7, "7:1 AAA text"],
              [4.5, "4.5:1 text"],
              [3, "3:1 large text & UI"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={String(v)}
              type="button"
              role="radio"
              aria-checked={filter === v}
              onClick={() => setFilter(v)}
              className="focus-ring rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
              style={{ borderColor: filter === v ? "var(--site-fg)" : "var(--site-line)", background: filter === v ? "var(--site-fg)" : "var(--site-surface)", color: filter === v ? "var(--site-bg)" : "var(--site-fg)" }}
            >
              {l} · {v === "all" ? PAIRINGS.length : PAIRINGS.filter((p) => p.min === v).length}
            </button>
          ))}
        </div>
        <PairingTable pairs={rows.map((p) => [p.fg, p.bg, p.where])} caption="Allowed pairings" />
      </Section>

      <Section title="Forbidden pairings" intro="These are tempting because they look on-brand. Each one fails, and the build checks they keep failing.">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Sample</th>
                <th>Foreground</th>
                <th>Background</th>
                <th>Measured</th>
                <th>Why it's forbidden</th>
              </tr>
            </thead>
            <tbody>
              {FORBIDDEN.map((f) => (
                <tr key={f.fg + f.bg}>
                  <td>
                    <span className="inline-grid h-9 w-[52px] place-items-center rounded-[8px] border border-[var(--site-line)] font-semibold" style={{ background: f.bgHex, color: f.fgHex }} aria-hidden>
                      Aa
                    </span>
                  </td>
                  <td>
                    <code className="tok">{f.fg}</code>
                  </td>
                  <td>
                    <code className="tok">{f.bg}</code>
                  </td>
                  <td>
                    <Verdict ratio={f.ratio} min={4.5} />
                  </td>
                  <td className="muted" style={{ minWidth: 260 }}>
                    {f.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

const STATUS_ORDER = Object.keys(LOAN_STATUSES) as LoanStatus[];
const TONE_TOKENS: Record<string, [string, string]> = {
  warning: ["status/warning-fg", "status/warning-bg"],
  info: ["status/info-fg", "status/info-bg"],
  success: ["status/success-fg", "status/success-bg"],
  brand: ["status/brand-fg", "status/brand-bg"],
  danger: ["status/danger-fg", "status/danger-bg"],
  neutral: ["status/neutral-fg", "status/neutral-bg"],
};
const LOANS: { name: string; amount: string; status: LoanStatus; due: string }[] = [
  { name: "Equipment loan · Adaeze Fabrics", amount: "₦1,500,000", status: "in_review", due: "Submitted today" },
  { name: "Stock loan · March", amount: "₦400,000", status: "paid", due: "Closed 2 Mar" },
  { name: "Stock loan · June", amount: "₦650,000", status: "overdue", due: "₦108,334 due 4 days ago" },
  { name: "Working capital", amount: "₦300,000", status: "pending", due: "Waiting for documents" },
  { name: "Expansion loan", amount: "₦2,000,000", status: "disbursed", due: "First payment 12 Nov" },
];

export function StatusWithoutColor() {
  const [sim, setSim] = useState<SimId>("achromatopsia");
  return (
    <>
      <PageHeader
        eyebrow="Foundations · Accessibility"
        title="Status without color"
        intro="Loan status is the most important information on the dashboard. Each status has its own word and icon, so it reads for colorblind applicants and on washed-out screens. Switch the simulation to check."
      />
      <Section title="Loan status chips">
        <SimulationPicker value={sim} onChange={setSim} />
        <div className="grid-2">
          <Specimen white label={<span className="eyebrow" style={{ color: "var(--text-secondary)" }}>Typical vision</span>}>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((s) => (
                <StatusChip key={s} status={s} />
              ))}
            </div>
          </Specimen>
          <Specimen white label={<span className="eyebrow" style={{ color: "var(--text-secondary)" }}>Simulated · {sim}</span>}>
            <div className="flex flex-wrap gap-2" style={simStyle(sim)}>
              {STATUS_ORDER.map((s) => (
                <StatusChip key={s} status={s} />
              ))}
            </div>
          </Specimen>
        </div>
        <PairingTable
          pairs={STATUS_ORDER.map((s) => {
            const [fg, bg] = TONE_TOKENS[LOAN_STATUSES[s].tone];
            return [fg, bg, `${LOAN_STATUSES[s].label} chip`];
          })}
        />
      </Section>
      <Section title="In context">
        <Specimen white className="overflow-hidden" label={<span className="eyebrow" style={{ color: "var(--text-secondary)" }}>Your loans · simulated {sim}</span>}>
          <ul className="m-0 flex list-none flex-col p-0" style={simStyle(sim)}>
            {LOANS.map((l) => (
              <li key={l.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] py-3.5 last:border-b-0">
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{l.name}</span>
                  <span className="text-[14px] text-[var(--text-secondary)]">{l.due}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-semibold tnum">{l.amount}</span>
                  <StatusChip status={l.status} />
                </span>
              </li>
            ))}
          </ul>
        </Specimen>
      </Section>
      <Section title="Do and don't">
        <div className="grid-2">
          <div className="dd">
            <div className="dd-stage">
              <StatusChip status="overdue" />
              <StatusChip status="paid" />
            </div>
            <div className="dd-bar do" />
            <h4>Do · word, icon and color together</h4>
            <p>Overdue and Paid differ in label and icon shape, so the difference survives grayscale and every type of color blindness.</p>
          </div>
          <div className="dd">
            <div className="dd-stage">
              <span className="flex items-center gap-2 text-[14px]">
                <Circle aria-hidden size={12} fill="#C62828" color="#C62828" /> ₦650,000
              </span>
              <span className="flex items-center gap-2 text-[14px]">
                <Circle aria-hidden size={12} fill="#1A7F47" color="#1A7F47" /> ₦400,000
              </span>
            </div>
            <div className="dd-bar dont" />
            <h4>Don't · a colored dot alone</h4>
            <p>Red and green dots measure {fmt(contrast("#C62828", "#1A7F47"))} against each other and collapse to the same grey for many applicants.</p>
          </div>
        </div>
      </Section>
    </>
  );
}

export function Tokens() {
  const ink = pairing("text/on-action", "action/ink");
  return (
    <>
      <PageHeader eyebrow="Foundations" title="Design tokens" intro="One source of truth, three outputs. Designers and engineers use the same names." />
      <Section title="Where tokens live">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>File</th>
                <th>What it is</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["tokens/source.json", "Primitives, semantic aliases, allowed pairings with thresholds, forbidden pairings"],
                ["build_tokens.py", "Measures every pairing and writes the outputs; exits non-zero on a failure"],
                ["tokens/tokens.css", "CSS custom properties: --color-pink-600, --action-primary …"],
                ["tokens/tokens.json", "W3C design tokens (DTCG) for tools"],
                ["tokens/pairings.json", "Every pairing with its measured ratio. This site reads it directly"],
                ["Figma variables", "Primitives (hidden) and Color collections, WEB code syntax = the CSS variable"],
              ].map(([f, d]) => (
                <tr key={f}>
                  <td>
                    <code className="tok">{f}</code>
                  </td>
                  <td className="muted">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="In code">
        <pre className="panel mono" style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: "22px" }}>
          {`/* tokens.css (generated) */
--color-neutral-900: #1F1B1D;
--action-ink: var(--color-neutral-900);
--text-on-action: var(--color-neutral-0);

/* Tailwind theme (loan app) */
@theme inline { --color-ink: var(--action-ink); --color-fg-on-action: var(--text-on-action); }

/* Component */
<button className="bg-ink text-fg-on-action">Continue</button>   /* ${fmt(ink.ratio)} */`}
        </pre>
      </Section>
    </>
  );
}
