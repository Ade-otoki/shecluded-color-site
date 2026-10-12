import { useState, type ReactNode } from "react";
import { Check, Minus, X } from "lucide-react";
import { clsx } from "clsx";
import { cssVar, fmt, level, pairing, thresholdLabel } from "./data";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: ReactNode }) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      {intro && <p className="page-intro">{intro}</p>}
    </header>
  );
}

export function Section({ id, title, intro, children }: { id?: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <h2 className="h2">{title}</h2>
        {intro && <div className="prose muted">{intro}</div>}
      </div>
      {children}
    </section>
  );
}

/** Ratio pill: number + level, with an icon so pass/fail never depends on color. */
export function Verdict({ ratio, min }: { ratio: number; min?: number }) {
  const l = level(ratio);
  const passes = min === undefined ? l.tone !== "fail" : ratio >= min;
  const tone = min === undefined ? l.tone : passes ? (l.tone === "warn" ? "warn" : "pass") : "fail";
  const Icon = passes ? (tone === "warn" ? Minus : Check) : X;
  return (
    <span className={clsx("verdict", tone)}>
      <Icon aria-hidden size={13} strokeWidth={3} />
      {fmt(ratio)} · {passes ? l.label : `Fails ${min ? (min >= 4.5 ? "text" : "UI") : ""}`.trim()}
    </span>
  );
}

/** "Aa" sample rendered with the real tokens. */
export function Sample({ fg, bg, large }: { fg: string; bg: string; large?: boolean }) {
  return (
    <span
      className="inline-grid place-items-center rounded-[8px] border border-[var(--site-line)] font-semibold"
      style={{ background: cssVar(bg), color: cssVar(fg), width: 52, height: 36, fontSize: large ? 20 : 15 }}
      aria-hidden
    >
      Aa
    </span>
  );
}

export type PairSpec = [fg: string, bg: string, where?: string, min?: number];

export function PairingTable({ pairs, caption }: { pairs: PairSpec[]; caption?: string }) {
  return (
    <div className="table-wrap">
      <table className="data">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">Sample</th>
            <th scope="col">Foreground</th>
            <th scope="col">Background</th>
            <th scope="col">Used for</th>
            <th scope="col">Needs</th>
            <th scope="col">Measured</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map(([fg, bg, where, min]) => {
            const p = pairing(fg, bg, where, min);
            return (
              <tr key={fg + bg + (where ?? "")}>
                <td>
                  <Sample fg={fg} bg={bg} />
                </td>
                <td>
                  <code className="tok">{fg}</code>
                </td>
                <td>
                  <code className="tok">{bg}</code>
                </td>
                <td className="muted" style={{ minWidth: 180 }}>
                  {where ?? p.where}
                </td>
                <td className="muted tnum" style={{ whiteSpace: "nowrap" }}>
                  {thresholdLabel(p.min)}
                </td>
                <td>
                  <Verdict ratio={p.ratio} min={p.min} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Specimen({ label, white, children, className }: { label?: ReactNode; white?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("specimen", white && "white", className)}>
      {label && <div className="specimen-label">{label}</div>}
      {children}
    </div>
  );
}

export function DoDont({ kind, title, children, stage }: { kind: "do" | "dont"; title: string; children: ReactNode; stage: ReactNode }) {
  return (
    <div className="dd">
      <div className="dd-stage">{stage}</div>
      <div className={clsx("dd-bar", kind)} />
      <h4>
        {kind === "do" ? <Check aria-hidden size={16} color="var(--site-pass)" /> : <X aria-hidden size={16} color="var(--site-fail)" />}
        {kind === "do" ? "Do" : "Don't"} · {title}
      </h4>
      <p>{children}</p>
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div className="flex flex-col gap-8">
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls={`panel-${t.id}`} onClick={() => setActive(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="flex flex-col gap-12">
          {t.content}
        </div>
      ))}
    </div>
  );
}

/* ---------- Color-vision simulation (Machado, Oliveira & Fernandes 2009, severity 1.0) ---------- */
export const SIMULATIONS = [
  { id: "none", label: "Typical vision" },
  { id: "protanopia", label: "Protanopia" },
  { id: "deuteranopia", label: "Deuteranopia" },
  { id: "tritanopia", label: "Tritanopia" },
  { id: "achromatopsia", label: "Grayscale" },
] as const;
export type SimId = (typeof SIMULATIONS)[number]["id"];

const MATRICES: Record<Exclude<SimId, "none" | "achromatopsia">, string> = {
  protanopia: "0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0",
  deuteranopia: "0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0",
  tritanopia: "1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0",
};

export function SimulationFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        {Object.entries(MATRICES).map(([id, values]) => (
          <filter id={`sim-${id}`} key={id} colorInterpolationFilters="linearRGB">
            <feColorMatrix type="matrix" values={values} />
          </filter>
        ))}
        <filter id="sim-achromatopsia" colorInterpolationFilters="linearRGB">
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
    </svg>
  );
}

export function SimulationPicker({ value, onChange }: { value: SimId; onChange: (v: SimId) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Simulate color vision">
      {SIMULATIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={value === s.id}
          onClick={() => onChange(s.id)}
          className="focus-ring rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors"
          style={{
            borderColor: value === s.id ? "var(--site-fg)" : "var(--site-line)",
            background: value === s.id ? "var(--site-fg)" : "var(--site-surface)",
            color: value === s.id ? "var(--site-bg)" : "var(--site-fg)",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export const simStyle = (id: SimId) => (id === "none" ? undefined : { filter: `url(#sim-${id})` });
