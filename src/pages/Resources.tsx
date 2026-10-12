import { FIGMA_URL, PROTOTYPE_FIGMA_URL } from "../data";
import { PageHeader, Section } from "../kit";

export function Resources() {
  return (
    <>
      <PageHeader eyebrow="Resources" title="Figma, code & tokens" intro="Where each part of the system lives, and how to keep them in sync." />
      <Section title="Figma">
        <div className="grid-2">
          {[
            ["Color accessibility design system", FIGMA_URL, "Variables, tonal scale, roles and pairings, components with contrast annotations, before and after, status without color, annotated screen, architecture."],
            ["Loan application design system", PROTOTYPE_FIGMA_URL, "The prototype's full library and the 16 desktop and mobile screens these components come from."],
          ].map(([t, url, d]) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="panel focus-ring" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8, color: "inherit", textDecoration: "none" }}>
              <span className="eyebrow">Figma file</span>
              <span className="h3" style={{ color: "var(--site-accent)" }}>
                {t} ↗
              </span>
              <span className="muted" style={{ fontSize: 15, lineHeight: "24px" }}>
                {d}
              </span>
            </a>
          ))}
        </div>
      </Section>
      <Section title="Code">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Path</th>
                <th>What it is</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["tokens/source.json", "Source of truth for colors and pairings"],
                ["build_tokens.py", "Validates pairings and generates tokens.css, tokens.json, pairings.json"],
                ["shecluded-loan-app/src/components", "The components shown on this site (copied into vendor/loan-app)"],
                ["shecluded-color-site/", "This site. npm run sync copies the components and pairings.json into vendor/"],
              ].map(([p, d]) => (
                <tr key={p}>
                  <td>
                    <code className="tok">{p}</code>
                  </td>
                  <td className="muted">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <pre className="panel mono" style={{ padding: 20, margin: 0, overflowX: "auto", fontSize: 13, lineHeight: "22px" }}>
          {`python3 build_tokens.py                  # measure every pairing
cd shecluded-loan-app && npm run tokens   # copy tokens into the app
cd ../shecluded-color-site && npm run sync && npm run build   # refresh vendor/ and rebuild this site`}
        </pre>
      </Section>
      <Section title="Standards">
        <div className="prose">
          <ul>
            <li>WCAG 2.1 contrast: 4.5:1 for normal text, 3:1 for large text (24px, or 19px bold) and UI components, 7:1 for AAA text.</li>
            <li>Color is never the only way information is shown (WCAG 1.4.1).</li>
            <li>Colorblind previews use the Machado, Oliveira and Fernandes (2009) simulation matrices at full severity.</li>
          </ul>
        </div>
      </Section>
    </>
  );
}
