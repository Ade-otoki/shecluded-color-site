import { useEffect, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, CloudCheck, LoaderCircle, MessageCircle, X } from "lucide-react";
import { STEPS, formatDuration, secondsLeft, stepIndex, stepSeconds, type StepId } from "../../lib/application";
import { useApplication } from "../../lib/store";
import { Button } from "../ui/Button";
import logoUrl from "../../assets/shecluded-logo.svg";
import { Eyebrow } from "../ui/Surface";

/** Official Shecluded logo (from shecluded.com/logo.svg). Keep its 112:18 ratio; never recolor. */
export function Logo({ className }: { className?: string }) {
  return <img src={logoUrl} alt="Shecluded" width={137} height={22} className={clsx("h-[22px] w-auto max-[360px]:h-[18px]", className)} />;
}

/** Top bar: Back · logo · Save and exit (Origin pattern). */
export function AppHeader({ onBack, showSave = true }: { onBack?: () => void; showSave?: boolean }) {
  const { saveAndExit } = useApplication();
  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-line bg-page/90 backdrop-blur-md">
      <div className="mx-auto grid h-[var(--layout-header)] max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <div>
          {onBack && (
            <Button variant="ghost" size="sm" iconLeft={<ArrowLeft aria-hidden className="size-4" />} onClick={onBack}>
              <span className="max-sm:sr-only">Back</span>
            </Button>
          )}
        </div>
        <Logo />
        <div className="flex justify-end">
          {showSave && (
            <Button variant="outline" size="sm" className="max-[360px]:gap-1 max-[360px]:px-2.5" iconRight={<X aria-hidden className="size-4" />} onClick={saveAndExit}>
              <span>
                Save<span className="max-sm:hidden"> and exit</span>
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function relativeTime(at: number, now: number) {
  const s = Math.round((now - at) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s} seconds ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hour${h === 1 ? "" : "s"} ago` : new Date(at).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function SavedAgo({ at }: { at: number }) {
  const now = useNow();
  return <>{relativeTime(at, Math.max(now, at))}</>;
}

/** Autosave status. Polite live region so screen readers hear "Saved" without interruption. */
export function SaveIndicator({ className }: { className?: string }) {
  const { saveState, app } = useApplication();
  return (
    <p aria-live="polite" className={clsx("flex items-center gap-1.5 text-caption text-fg-muted", className)}>
      {saveState === "saving" ? (
        <>
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> Saving…
        </>
      ) : app.savedAt ? (
        <>
          <CloudCheck aria-hidden className="size-3.5 text-success-fg" /> Saved on this device <SavedAgo at={app.savedAt} />
        </>
      ) : (
        <>
          <CloudCheck aria-hidden className="size-3.5" /> Your progress saves as you go
        </>
      )}
    </p>
  );
}

type StepState = "done" | "current" | "upcoming";

function StepDot({ state, n }: { state: StepState; n: number }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "grid size-7 shrink-0 place-items-center rounded-full border text-caption font-semibold tabular transition-colors",
        state === "done" && "border-ink bg-raised text-fg",
        state === "current" && "border-ink bg-ink text-fg-on-action",
        state === "upcoming" && "border-line-control bg-raised text-fg-muted",
      )}
    >
      {state === "done" ? <Check className="size-3.5" strokeWidth={2.5} /> : n}
    </span>
  );
}

/** Desktop step rail: counter, steps with time, save state, help (Mercury + OKX pattern). */
export function StepRail({ current }: { current: StepId }) {
  const { app, go, returnTo } = useApplication();
  const ci = stepIndex(current);
  return (
    <nav aria-label="Application steps" className="sticky top-[calc(var(--layout-header)+40px)] hidden self-start w-[var(--layout-rail)] shrink-0 flex-col gap-6 lg:flex">
      <div>
        <Eyebrow>Loan application</Eyebrow>
        <p className="mt-2 font-display text-[44px] leading-none text-fg tabular">
          {ci + 1}
          <span className="text-fg-placeholder"> / {STEPS.length}</span>
        </p>
        <p className="mt-2 text-small text-fg-muted">About {formatDuration(secondsLeft(current, app.business.registered))} left</p>
      </div>
      <ol className="flex flex-col">
        {STEPS.map((s, i) => {
          const state: StepState = i < ci ? "done" : i === ci ? "current" : "upcoming";
          const reachable = i <= app.furthestStep && i !== ci && !returnTo;
          const inner = (
            <>
              <StepDot state={state} n={i + 1} />
              <span className="flex flex-1 flex-col text-left">
                <span className={clsx("text-small", state === "upcoming" ? "text-fg-muted" : "font-medium text-fg")}>{s.name}</span>
              </span>
              <span className="text-caption text-fg-muted tabular">{formatDuration(stepSeconds(s, app.business.registered))}</span>
            </>
          );
          return (
            <li key={s.id} className="relative">
              {i < STEPS.length - 1 && (
                <span aria-hidden className={clsx("absolute left-[13.5px] top-9 h-[calc(100%-28px)] w-px", i < ci ? "bg-ink" : "bg-line")} />
              )}
              {reachable ? (
                <button type="button" onClick={() => go(s.id)} className="flex w-full items-center gap-3 rounded-sm py-2.5 hover:bg-subtle/60">
                  {inner}
                  <span className="sr-only">{state === "done" ? "(completed, edit)" : ""}</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 py-2.5" aria-current={state === "current" ? "step" : undefined}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <SaveIndicator />
        <a href="#help" className="flex w-fit items-center gap-1.5 text-small font-medium text-fg underline decoration-line-control underline-offset-4 hover:decoration-fg">
          <MessageCircle aria-hidden className="size-4" /> Questions? Chat with us
        </a>
      </div>
    </nav>
  );
}

/** Mobile progress: segmented bar + step name and time left. */
export function MobileProgress({ current }: { current: StepId }) {
  const { app } = useApplication();
  const ci = stepIndex(current);
  return (
    <div className="lg:hidden">
      <div className="flex gap-1" role="progressbar" aria-label="Application progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={ci + 1} aria-valuetext={`Step ${ci + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <span key={s.id} className={clsx("h-1 flex-1 rounded-full", i <= ci ? "bg-brand-mark" : "bg-line")} />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-caption text-fg-muted">
        <span>
          Step {ci + 1} of {STEPS.length} · <span className="text-fg">{STEPS[ci].name}</span>
        </span>
        <span>~{formatDuration(secondsLeft(current, app.business.registered))} left</span>
      </div>
    </div>
  );
}

/** Frame for one step: rail, heading, content and actions (sticky on mobile). */
export function StepLayout({
  step,
  title,
  description,
  children,
  actions,
  onBack,
}: {
  step: StepId;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
  onBack?: () => void;
}) {
  const reduce = useReducedMotion();
  const i = stepIndex(step);
  return (
    <>
      <AppHeader onBack={onBack} />
      <div className="mx-auto flex max-w-[1120px] gap-16 px-4 pb-32 pt-6 sm:px-6 lg:pb-20 lg:pt-12">
        <StepRail current={step} />
        <main className="mx-auto w-full max-w-[var(--layout-content-max)] lg:mx-0">
          <MobileProgress current={step} />
          <motion.div
            key={step}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 lg:mt-0"
          >
            <Eyebrow className="max-lg:hidden">
              Step {i + 1} of {STEPS.length}
            </Eyebrow>
            <h1 className="text-h1 mt-2 text-fg">{title}</h1>
            {description && <p className="mt-2 text-fg-muted">{description}</p>}
            <div className="mt-8 flex flex-col gap-5">{children}</div>
          </motion.div>
          {/* Outside the animated wrapper: a transformed ancestor would break position: fixed on mobile. */}
          <div
            className={clsx(
              "fixed inset-x-0 bottom-0 z-[var(--z-action-bar)] border-t border-line bg-page/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md",
              "lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
            )}
          >
            <div className="mx-auto flex max-w-[var(--layout-content-max)] items-center justify-between gap-3">{actions}</div>
            <div className="mt-2 flex items-center justify-center gap-3 lg:hidden">
              <SaveIndicator />
              <PrototypeTrigger />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/** Phone-only entry to the demo controls, so they never float over the form. Opens the panel rendered in App. */
export function PrototypeTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("prototype:open"))}
      className={clsx("rounded-sm px-1 text-caption text-fg-muted underline decoration-line-control underline-offset-4 hover:text-fg", className)}
    >
      Prototype
    </button>
  );
}

/** Ink toast, bottom-centre, auto-dismisses. */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(t);
  }, [message, onDone]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-[var(--z-toast)] flex justify-center px-4 lg:bottom-8">
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-small text-fg-on-action shadow-float"
          >
            <CloudCheck aria-hidden className="size-4" /> {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
