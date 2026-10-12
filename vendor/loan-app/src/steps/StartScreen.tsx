import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Clock, FileText, IdCard, Landmark, RotateCcw } from "lucide-react";
import { STEPS, formatDuration, formatNaira, secondsLeft, stepIndex, totalSeconds, type StepId } from "../lib/application";
import { useApplication } from "../lib/store";
import { AppHeader, SavedAgo } from "../components/flow/Shell";
import { Card, Eyebrow, ProgressBar } from "../components/ui/Surface";
import { Button } from "../components/ui/Button";

const NEEDS = [
  { icon: IdCard, label: "A government ID", note: "NIN slip, voter's card, passport or driver's licence" },
  { icon: Landmark, label: "6 months of bank statements", note: "The PDF from your bank app is fine" },
  { icon: FileText, label: "Your CAC certificate", note: "Only if your business is registered" },
];

/** Entry point. New applicants see what to expect; returning applicants see where they left off. */
export function StartScreen() {
  const { app, hasDraft, go, reset } = useApplication();
  const [confirming, setConfirming] = useState(false);

  const resumeAt: StepId = STEPS[Math.max(0, app.furthestStep)].id;
  const resumeIndex = stepIndex(resumeAt);
  const percent = Math.round((resumeIndex / STEPS.length) * 100);

  return (
    <>
      <AppHeader showSave={false} />
      <main className="mx-auto flex max-w-[var(--layout-content-max)] flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:pt-20">
        <div>
          <Eyebrow>Business loans for women</Eyebrow>
          <h1 className="text-display mt-3 text-fg max-sm:text-[36px] max-sm:leading-[40px]">
            {hasDraft ? `Welcome back${app.business.businessName ? `, ${app.business.businessName}` : ""}.` : "Funding for the business you're building."}
          </h1>
          <p className="mt-3 text-fg-muted">
            {hasDraft
              ? "Your application is saved on this device. Pick up exactly where you stopped."
              : `${STEPS.length} short steps, about ${formatDuration(totalSeconds(), "long")}. Save anytime and come back when it suits you.`}
          </p>
        </div>

        {hasDraft ? (
          <Card eyebrow="Saved application" action={app.savedAt ? <span className="text-caption text-fg-muted">Saved <SavedAgo at={app.savedAt} /></span> : null}>
            <div className="flex flex-col gap-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-small text-fg-muted">
                    Next up · Step {resumeIndex + 1} of {STEPS.length}
                  </p>
                  <p className="text-h2 mt-0.5 text-fg">{STEPS[resumeIndex].name}</p>
                </div>
                <p className="text-numeral text-fg">{percent}%</p>
              </div>
              <ProgressBar value={Math.max(percent, 4)} label="Application progress" />
              <dl className="grid grid-cols-2 gap-3 text-small">
                <div className="rounded-sm bg-subtle px-3 py-2.5">
                  <dt className="text-fg-muted">Asking for</dt>
                  <dd className="font-semibold text-fg tabular">{formatNaira(app.loan.amount ?? 0)}</dd>
                </div>
                <div className="rounded-sm bg-subtle px-3 py-2.5">
                  <dt className="text-fg-muted">Time left</dt>
                  <dd className="font-semibold text-fg">About {formatDuration(secondsLeft(resumeAt, app.business.registered))}</dd>
                </div>
              </dl>
              <Button block iconRight={<ArrowRight aria-hidden className="size-4" />} onClick={() => go(resumeAt)}>
                Continue where you left off
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Card eyebrow="What you'll need">
              <ul className="flex flex-col">
                {NEEDS.map(({ icon: Icon, label, note }) => (
                  <li key={label} className="flex items-start gap-3.5 border-b border-line py-3.5 first:pt-0 last:border-b-0 last:pb-0">
                    <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-subtle">
                      <Icon aria-hidden className="size-5 text-icon" />
                    </span>
                    <span>
                      <span className="block font-medium text-fg">{label}</span>
                      <span className="text-small text-fg-muted">{note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <ol className="grid grid-cols-5 gap-1.5" aria-label="Steps">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex flex-col gap-2">
                  <span className="h-1 rounded-full bg-line" />
                  <span className="text-caption text-fg-muted">
                    <span className="tabular">{i + 1}</span>
                    <span className="max-sm:sr-only"> · {s.short}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-3">
              <Button block iconRight={<ArrowRight aria-hidden className="size-4" />} onClick={() => go("business")}>
                Start application
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-caption text-fg-muted">
                <Clock aria-hidden className="size-3.5" /> About {formatDuration(totalSeconds(), "long")} · Progress saves automatically
              </p>
            </div>
          </>
        )}

        {hasDraft && (
          <div className="flex flex-col items-center gap-3">
            <AnimatePresence mode="wait" initial={false}>
              {confirming ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex w-full flex-col items-center gap-3 rounded-md border border-line bg-raised p-4 text-center"
                  role="alertdialog"
                  aria-label="Start over?"
                >
                  <p className="text-small text-fg">This deletes your saved answers and documents. You can't undo it.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                      Keep my application
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        reset();
                        setConfirming(false);
                      }}
                    >
                      Delete and start over
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Button variant="ghost" size="sm" iconLeft={<RotateCcw aria-hidden className="size-4" />} onClick={() => setConfirming(true)}>
                    Start a new application instead
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-caption text-fg-muted">
          <Building2 aria-hidden className="size-3.5" /> Prototype · data stays on this device
        </p>
      </main>
    </>
  );
}
