import { ArrowRight } from "lucide-react";
import { Button } from "@app/components/ui/Button";
import { StatusChip } from "@app/components/ui/Surface";
import { FORBIDDEN, PAIRINGS, PRIMITIVE_COUNT, SCALE, SEMANTIC, contrast, fmt, pairing } from "../data";
import { PageHeader, Section, Specimen, Verdict } from "../kit";

const BRAND = "#EB2590";
const ACTION = "#D2137A";

export function Overview() {
  const pink = SCALE.pink;
  return (
    <>
      <PageHeader
        eyebrow="Shecluded design system · Color accessibility"
        title="Keep the pink. Fix the contrast."
        intro={
          <>
            Shecluded's brand pink {BRAND} is bold and recognisable, but white text on it measures {fmt(contrast("#FFFFFF", BRAND))}, below the 4.5:1 that button
            labels need. This system keeps the pink and gives every shade of it a job, so each pairing on a lending product used on phones, outdoors and on
            older screens passes WCAG 2.1.
          </>
        }
      />

      {/* Hero: the problem and the answer in one specimen */}
      <Specimen white label={<span className="eyebrow">One hue, eleven steps, each with a job</span>}>
        <div className="scale-grid grid gap-1.5" style={{ ["--steps" as string]: pink.length }}>
          {pink.map((s) => (
            <div key={s.step} className="flex flex-col gap-1.5">
              <div
                className="flex h-24 items-end rounded-[10px] p-2 text-[11px] font-semibold tnum"
                style={{ background: s.hex, color: s.white >= s.black ? "#FFFFFF" : "#1F1B1D", outline: s.hex === BRAND ? "2px solid #1F1B1D" : undefined, outlineOffset: 2 }}
              >
                {s.step}
              </div>
              <span className="mono hidden text-[11px] text-[var(--text-secondary)] sm:block">{s.hex}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--border-subtle)] p-5">
            <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
              Before · brand pink {BRAND}
            </span>
            <button type="button" className="h-12 w-fit rounded-[10px] px-5 font-medium" style={{ background: BRAND, color: "#FFFFFF" }}>
              Continue to your loan
            </button>
            <Verdict ratio={contrast("#FFFFFF", BRAND)} min={4.5} />
          </div>
          <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--border-subtle)] p-5">
            <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
              After · action pink {ACTION}
            </span>
            <Button variant="brand" className="w-fit">
              Continue to your loan
            </Button>
            <Verdict ratio={contrast("#FFFFFF", ACTION)} min={4.5} />
          </div>
        </div>
      </Specimen>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {[
          [`${PAIRINGS.filter((p) => p.pass).length}/${PAIRINGS.length}`, "allowed pairings pass, measured at build time"],
          [String(FORBIDDEN.length), "forbidden pairings, confirmed to fail AA"],
          [String(PRIMITIVE_COUNT), "primitive tones across six families"],
          [String(SEMANTIC.length), "semantic tokens, each with one job"],
        ].map(([n, l]) => (
          <div key={l} className="panel" style={{ padding: 20 }}>
            <p className="tnum" style={{ fontFamily: "var(--font-site-display)", fontSize: 44, lineHeight: 1, margin: 0 }}>
              {n}
            </p>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
              {l}
            </p>
          </div>
        ))}
      </div>

      <Section title="Three principles">
        <div className="grid-3">
          {[
            ["The pink is the brand", "Replacing it was never an option. #EB2590 stays for the logo, large display text, icons, focus rings and selected outlines, where 3:1 applies and it passes."],
            ["Every shade has a job", "Buttons and links move one step deeper to #D2137A (5.10:1). Pink on pink tints uses #BB116D (5.28:1). Forward actions in the loan flow use ink (17.03:1)."],
            ["Never color alone", "Loan status is the most important information on the dashboard. Every status carries a word and its own icon, so it reads in grayscale and for colorblind applicants."],
          ].map(([t, d], i) => (
            <div key={t} className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="eyebrow">Principle {i + 1}</span>
              <h3 className="h3">{t}</h3>
              <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: "24px" }}>
                {d}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Built for the loan application" intro="Every component on this site is the production component from the Shecluded loan application prototype, rendered live.">
        <Specimen>
          <div className="flex flex-wrap items-center gap-3">
            <Button iconRight={<ArrowRight aria-hidden className="size-4" />}>Continue to documents</Button>
            <Button variant="outline">Save and exit</Button>
            <Button variant="brand">Submit application</Button>
            <StatusChip status="in_review" />
            <StatusChip status="approved" />
            <StatusChip status="overdue" />
          </div>
        </Specimen>
        <div className="flex flex-wrap gap-4">
          <a className="site-link h3" href="#start">
            Start using the system →
          </a>
          <a className="site-link h3" href="#pairings">
            Check a pairing →
          </a>
        </div>
      </Section>
    </>
  );
}

export function GettingStarted() {
  return (
    <>
      <PageHeader
        eyebrow="Get started"
        title="Using the system"
        intro="Pick colors by job, not by eye. If the job exists, the token already passes; if it doesn't, add a pairing and let the build measure it."
      />
      <Section title="Three layers">
        <div className="grid-3">
          {[
            ["Primitives", "pink.600, neutral.900", "Raw tones. Hidden from designers in Figma and never referenced directly by components."],
            ["Semantic tokens", "action/primary, text/link-on-tint", "A job with a name. Aliases one primitive. This is what designers pick and engineers write."],
            ["Components", "Button, Chip, Status chip", "Consume semantic tokens only. Changing a primitive updates every component that uses it."],
          ].map(([t, eg, d]) => (
            <div key={t} className="panel" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <h3 className="h3">{t}</h3>
              <code className="tok" style={{ width: "fit-content" }}>
                {eg}
              </code>
              <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: "24px" }}>
                {d}
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Which pink do I use?">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>I need…</th>
                <th>Use</th>
                <th>Measured</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["A button that commits (Submit application)", "action/primary", "text/on-action", "action/primary"],
                  ["A button that moves forward (Continue)", "action/ink", "text/on-action", "action/ink"],
                  ["A link on white", "text/link", "text/link", "surface/raised"],
                  ["Pink text on a pink tint card", "text/link-on-tint", "text/link-on-tint", "surface/brand-tint"],
                  ["Small pink text that must reach AAA", "text/accent-strong", "text/accent-strong", "surface/raised"],
                  ["A big pink headline, 24px+", "text/brand-display", "text/brand-display", "surface/raised"],
                  ["A focus ring or selected outline", "border/focus · border/brand", "border/focus", "surface/raised"],
                  ["Body text on a pink card", "text/primary on surface/brand-tint", "text/primary", "surface/brand-tint"],
                ] as const
              ).map(([need, tok, fg, bg]) => (
                <tr key={need}>
                  <td>{need}</td>
                  <td>
                    <code className="tok">{tok}</code>
                  </td>
                  <td>
                    <Verdict ratio={pairing(fg, bg).ratio} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
          Each ratio is the measured pairing from the token build: labels against their button fill, everything else against white unless stated.
        </p>
      </Section>
      <Section title="Adding a pairing" intro="The build fails if any allowed pairing drops below its threshold, or if a forbidden pairing starts to pass.">
        <pre className="panel mono" style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: "22px" }}>
          {`// tokens/source.json → "pairings"
{ "fg": "text/link-on-tint", "bg": "surface/brand-tint", "min": 4.5, "where": "Pink text on balance card" }

$ python3 build_tokens.py
48/48 allowed pairings pass; 7 forbidden pairings confirmed failing AA.`}
        </pre>
      </Section>
    </>
  );
}
