import { useEffect, useState, type ReactNode } from "react";
import { ApplicationProvider } from "@app/lib/store";
import logoUrl from "@app/assets/shecluded-logo.svg";
import { SimulationFilters } from "./kit";
import { Overview, GettingStarted } from "./pages/Overview";
import { ColorScale, ColorRoles, Pairings, StatusWithoutColor, Tokens } from "./pages/Foundations";
import { Buttons, Chips, Badges, Fields, Selection, Feedback, Progress, Upload } from "./pages/Components";
import { BeforeAfter, Annotated, Architecture } from "./pages/Patterns";
import { Resources } from "./pages/Resources";


type Route = { id: string; label: string; render: () => ReactNode };
const NAV: { group: string; routes: Route[] }[] = [
  { group: "Get started", routes: [{ id: "overview", label: "Overview", render: () => <Overview /> }, { id: "start", label: "Using the system", render: () => <GettingStarted /> }] },
  {
    group: "Foundations",
    routes: [
      { id: "scale", label: "Tonal scale", render: () => <ColorScale /> },
      { id: "roles", label: "Color roles", render: () => <ColorRoles /> },
      { id: "pairings", label: "Contrast pairings", render: () => <Pairings /> },
      { id: "status", label: "Status without color", render: () => <StatusWithoutColor /> },
      { id: "tokens", label: "Design tokens", render: () => <Tokens /> },
    ],
  },
  {
    group: "Components",
    routes: [
      { id: "buttons", label: "Buttons", render: () => <Buttons /> },
      { id: "chips", label: "Chips", render: () => <Chips /> },
      { id: "badges", label: "Badges & status", render: () => <Badges /> },
      { id: "fields", label: "Text fields", render: () => <Fields /> },
      { id: "selection", label: "Selection cards", render: () => <Selection /> },
      { id: "feedback", label: "Alerts & toasts", render: () => <Feedback /> },
      { id: "progress", label: "Progress & steps", render: () => <Progress /> },
      { id: "upload", label: "Document upload", render: () => <Upload /> },
    ],
  },
  {
    group: "Patterns",
    routes: [
      { id: "before-after", label: "Before & after", render: () => <BeforeAfter /> },
      { id: "annotated", label: "Annotated screen", render: () => <Annotated /> },
      { id: "architecture", label: "System architecture", render: () => <Architecture /> },
    ],
  },
  { group: "Resources", routes: [{ id: "resources", label: "Figma, code & tokens", render: () => <Resources /> }] },
];
const ROUTES = NAV.flatMap((g) => g.routes);

function useRoute() {
  const read = () => {
    const h = window.location.hash.replace("#", "");
    return ROUTES.some((r) => r.id === h) ? h : "overview";
  };
  const [id, setId] = useState(read);
  useEffect(() => {
    const on = () => {
      setId(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return id;
}

export function App() {
  const id = useRoute();
  const [open, setOpen] = useState(false);
  const route = ROUTES.find((r) => r.id === id)!;
  useEffect(() => {
    document.title = id === "overview" ? "Shecluded Color Accessibility" : `${route.label} · Shecluded Color Accessibility`;
    setOpen(false);
  }, [id, route.label]);

  // Phone menu: lock the page behind the drawer and close it with Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <ApplicationProvider>
      <SimulationFilters />
      <header className="site-top">
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
        <a href="#overview" className="brand focus-ring" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="brand-chip">
            <img src={logoUrl} alt="Shecluded" width={112} height={18} />
          </span>
          <span className="brand-name">Color accessibility</span>
          <span className="brand-sub">Design system · WCAG 2.1</span>
        </a>
        <span className="spacer" />
        <a className="top-link focus-ring" href="#pairings">
          Pairings
        </a>
        <a className="top-link focus-ring" href="#buttons">
          Components
        </a>
        <a className="top-link focus-ring" href="#resources">
          Figma &amp; code
        </a>
      </header>
      <div className="site-body">
        <nav id="site-nav" className="site-nav" aria-label="Documentation" data-open={open}>
          {NAV.map((g) => (
            <div className="nav-group" key={g.group}>
              <h3>{g.group}</h3>
              {g.routes.map((r) => (
                <a key={r.id} href={`#${r.id}`} aria-current={r.id === id ? "page" : undefined}>
                  {r.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <main className="site-main">
          <div className="page" key={id}>
            {route.render()}
            <Pager id={id} />
          </div>
        </main>
      </div>
    </ApplicationProvider>
  );
}

function Pager({ id }: { id: string }) {
  const i = ROUTES.findIndex((r) => r.id === id);
  const prev = ROUTES[i - 1];
  const next = ROUTES[i + 1];
  return (
    <nav className="grid-2" aria-label="Previous and next page" style={{ borderTop: "1px solid var(--site-line)", paddingTop: 32 }}>
      <div>{prev && <PagerLink r={prev} dir="Previous" />}</div>
      <div style={{ textAlign: "right" }}>{next && <PagerLink r={next} dir="Next" />}</div>
    </nav>
  );
}

function PagerLink({ r, dir }: { r: Route; dir: string }) {
  return (
    <a href={`#${r.id}`} className="focus-ring" style={{ display: "inline-flex", flexDirection: "column", gap: 4, textDecoration: "none", color: "inherit" }}>
      <span className="eyebrow">{dir}</span>
      <span className="h3" style={{ color: "var(--site-accent)" }}>
        {r.label}
      </span>
    </a>
  );
}
