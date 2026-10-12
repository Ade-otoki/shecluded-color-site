import { useState } from "react";
import { clsx } from "clsx";
import { FlaskConical, X } from "lucide-react";
import { ApplicationProvider, useApplication } from "./lib/store";
import { Toast } from "./components/flow/Shell";
import { StartScreen } from "./steps/StartScreen";
import { BusinessStep } from "./steps/BusinessStep";
import { LoanStep } from "./steps/LoanStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ConsentStep } from "./steps/ConsentStep";
import { SubmittedScreen } from "./steps/SubmittedScreen";

function Screen() {
  const { app } = useApplication();
  switch (app.step) {
    case "start":
      return <StartScreen />;
    case "business":
      return <BusinessStep />;
    case "loan":
      return <LoanStep />;
    case "documents":
      return <DocumentsStep />;
    case "review":
      return <ReviewStep />;
    case "consent":
      return <ConsentStep />;
    case "submitted":
      return <SubmittedScreen />;
  }
}

/** Demo-only controls: simulate a weak connection to show the upload retry path. Not part of the product. */
function PrototypeControls() {
  const { weakNetwork, setWeakNetwork } = useApplication();
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 left-4 z-[var(--z-dialog)] max-lg:bottom-[140px] max-lg:left-auto max-lg:right-3">
      {open ? (
        <div className="w-64 rounded-md border border-line bg-raised p-4 shadow-float">
          <div className="flex items-center justify-between">
            <p className="text-eyebrow text-fg-muted">Prototype controls</p>
            <button type="button" aria-label="Close prototype controls" onClick={() => setOpen(false)} className="rounded-sm p-1 hover:bg-subtle">
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 text-small text-fg">
            Simulate weak connection
            <input type="checkbox" role="switch" className="peer sr-only" checked={weakNetwork} onChange={(e) => setWeakNetwork(e.target.checked)} />
            <span
              aria-hidden
              className={clsx(
                "relative h-6 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                weakNetwork ? "bg-ink" : "bg-line-control",
              )}
            >
              <span className={clsx("absolute top-1 size-4 rounded-full bg-raised transition-transform", weakNetwork ? "translate-x-5" : "translate-x-1")} />
            </span>
          </label>
          <p className="mt-2 text-caption text-fg-muted">The next upload stops at 55% so you can try the retry flow.</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-2 max-lg:px-2.5 text-caption font-medium text-fg-muted shadow-float hover:text-fg"
        >
          <FlaskConical aria-hidden className="size-3.5" />
          <span className="max-lg:sr-only">Prototype</span>
          {weakNetwork && <span className="ml-1 rounded-full bg-warning-bg px-1.5 text-warning-fg">Weak network</span>}
        </button>
      )}
    </div>
  );
}

function ToastHost() {
  const { toast, dismissToast } = useApplication();
  return <Toast message={toast} onDone={dismissToast} />;
}

export default function App() {
  return (
    <ApplicationProvider>
      <Screen />
      <ToastHost />
      <PrototypeControls />
    </ApplicationProvider>
  );
}
