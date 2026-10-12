import { useEffect, useRef, useState, type DragEvent } from "react";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, FileText, Lock, RotateCw, Trash2, Upload, WifiOff, X } from "lucide-react";
import {
  ACCEPTED_TYPES,
  ID_TYPES,
  MAX_BYTES,
  formatBytes,
  requiredDocs,
  type DocKey,
  type UploadedDoc,
} from "../lib/application";
import { useApplication } from "../lib/store";
import { useStepNav } from "./useStepNav";
import { StepLayout } from "../components/flow/Shell";
import { Field } from "../components/ui/Field";
import { Select } from "../components/ui/Input";
import { Badge, Card, ProgressBar } from "../components/ui/Surface";
import { Button } from "../components/ui/Button";

const DOCS: Record<DocKey, { eyebrow: string; title: string; tip: string }> = {
  id: { eyebrow: "Government ID", title: "Photo of your ID", tip: "A clear photo with all four corners visible. No glare." },
  statement: { eyebrow: "Bank statement", title: "Last 6 months of statements", tip: "The PDF from your bank app works best. Screenshots are fine too." },
  cac: { eyebrow: "CAC certificate", title: "Certificate of registration", tip: "A photo or scan of the certificate from CAC." },
};

const WEAK_NETWORK_STOP = 55;

/** One upload slot. Simulates a resumable, chunked upload so the weak-connection path can be demoed. */
export function UploadTile({ docKey, missing }: { docKey: DocKey; missing: boolean }) {
  const { app, setFile, weakNetwork } = useApplication();
  const doc = app.documents.files[docKey];
  const meta = DOCS[docKey];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const docRef = useRef(doc);
  docRef.current = doc;

  // Drive progress while uploading. Pauses if the applicant leaves the step and resumes when they return.
  useEffect(() => {
    if (doc?.status !== "uploading") return;
    const t = window.setInterval(() => {
      const d = docRef.current;
      if (!d || d.status !== "uploading") return;
      const progress = Math.min(100, d.progress + 4 + Math.random() * 7);
      const firstAttempt = (d.attempts ?? 1) === 1;
      if (weakNetwork && firstAttempt && d.progress < WEAK_NETWORK_STOP && progress >= WEAK_NETWORK_STOP) {
        setFile(docKey, {
          ...d,
          progress: WEAK_NETWORK_STOP,
          status: "failed",
          retryable: true,
          error: `Your connection dropped at ${WEAK_NETWORK_STOP}%. Try again and we'll continue from there.`,
        });
        return;
      }
      setFile(docKey, { ...d, progress, status: progress >= 100 ? "done" : "uploading" });
    }, 160);
    return () => window.clearInterval(t);
  }, [doc?.status, docKey, setFile, weakNetwork]);

  function accept(file: File | undefined) {
    if (!file) return;
    const base = { name: file.name, sizeBytes: file.size, progress: 0, attempts: 1 };
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFile(docKey, { ...base, status: "failed", retryable: false, error: "We can only accept PDF, JPG or PNG files. Choose another file." });
    } else if (file.size > MAX_BYTES) {
      setFile(docKey, {
        ...base,
        status: "failed",
        retryable: false,
        error: `This file is ${formatBytes(file.size)}. Choose one under 10 MB — a photo of each page works.`,
      });
    } else {
      setFile(docKey, { ...base, status: "uploading" });
    }
  }

  const retry = (d: UploadedDoc) => setFile(docKey, { ...d, status: "uploading", error: undefined, attempts: (d.attempts ?? 1) + 1 });
  const choose = () => inputRef.current?.click();

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files[0]);
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      onChange={(e) => {
        accept(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const status =
    doc?.status === "done" ? (
      <Badge tone="success" icon={<CircleCheck aria-hidden className="size-3.5" />}>Uploaded</Badge>
    ) : doc?.status === "failed" ? (
      <Badge tone="danger" icon={<CircleAlert aria-hidden className="size-3.5" />}>{doc.retryable ? "Interrupted" : "Can't use this file"}</Badge>
    ) : doc?.status === "uploading" ? (
      <Badge tone="neutral">Uploading</Badge>
    ) : (
      <Badge tone={missing ? "danger" : "neutral"}>{missing ? "Needed to continue" : "Required"}</Badge>
    );

  return (
    <Card eyebrow={meta.eyebrow} action={status}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-medium text-fg">{meta.title}</p>
          <p className="mt-0.5 text-small text-fg-muted">{meta.tip}</p>
        </div>

        {docKey === "id" && (
          <Field label="ID type">
            <IdTypeSelect />
          </Field>
        )}

        {fileInput}

        {!doc && (
          <button
            type="button"
            onClick={choose}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={clsx(
              "flex flex-col items-center gap-2 rounded-md border-[1.5px] border-dashed px-4 py-7 text-center transition-colors duration-150",
              dragging ? "border-brand-mark bg-brand-tint" : missing ? "border-danger bg-danger-bg/40" : "border-line-control bg-subtle/50 hover:bg-subtle",
            )}
          >
            <span className="grid size-10 place-items-center rounded-full border border-line bg-raised">
              <Upload aria-hidden className="size-5 text-icon" />
            </span>
            <span className="font-medium text-fg">Choose a file or take a photo</span>
            <span className="text-caption text-fg-muted">PDF, JPG or PNG · up to 10 MB</span>
          </button>
        )}

        {doc && (
          <div
            className={clsx(
              "rounded-md border p-4",
              doc.status === "failed" ? "border-danger bg-danger-bg/40" : doc.status === "done" ? "border-line bg-raised" : "border-line bg-subtle/50",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={clsx(
                  "grid size-10 shrink-0 place-items-center rounded-sm",
                  doc.status === "done" ? "bg-success-bg text-success-fg" : doc.status === "failed" ? "bg-raised text-danger-fg" : "bg-raised text-icon",
                )}
              >
                {doc.status === "done" ? (
                  <CircleCheck aria-hidden className="size-5" />
                ) : doc.status === "failed" && doc.retryable ? (
                  <WifiOff aria-hidden className="size-5" />
                ) : doc.status === "failed" ? (
                  <CircleAlert aria-hidden className="size-5" />
                ) : (
                  <FileText aria-hidden className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg" title={doc.name}>{doc.name}</p>
                <p className="text-small text-fg-muted tabular">
                  {formatBytes(doc.sizeBytes)}
                  {doc.status === "uploading" && ` · Uploading ${Math.round(doc.progress)}%`}
                  {doc.status === "done" && " · Uploaded securely"}
                  {doc.status === "failed" && doc.retryable && ` · Stopped at ${Math.round(doc.progress)}%`}
                </p>
              </div>
              {doc.status === "uploading" && (
                <Button variant="ghost" size="sm" aria-label={`Cancel upload of ${doc.name}`} onClick={() => setFile(docKey, undefined)}>
                  <X aria-hidden className="size-4" />
                </Button>
              )}
              {doc.status === "done" && (
                <Button variant="ghost" size="sm" aria-label={`Remove ${doc.name}`} onClick={() => setFile(docKey, undefined)}>
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              )}
            </div>

            {(doc.status === "uploading" || (doc.status === "failed" && doc.retryable)) && (
              <ProgressBar
                className="mt-3"
                value={doc.progress}
                tone={doc.status === "failed" ? "danger" : "brand"}
                label={`Upload progress for ${doc.name}`}
              />
            )}

            {doc.status === "failed" && (
              <div className="mt-3 flex flex-col gap-3">
                <p role="alert" className="text-small text-danger-fg">
                  {doc.error}
                </p>
                <div className="flex flex-wrap gap-2">
                  {doc.retryable ? (
                    <Button size="sm" iconLeft={<RotateCw aria-hidden className="size-4" />} onClick={() => retry(doc)}>
                      Try again
                    </Button>
                  ) : (
                    <Button size="sm" iconLeft={<Upload aria-hidden className="size-4" />} onClick={choose}>
                      Choose another file
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setFile(docKey, undefined)}>
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function IdTypeSelect() {
  const { app, setIdType } = useApplication();
  return (
    <Select value={app.documents.idType} onChange={(e) => setIdType(e.target.value)}>
      {ID_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </Select>
  );
}

export function DocumentsStep() {
  const { app, go } = useApplication();
  const { next, nextLabel, editing } = useStepNav("documents", "review", "Continue to review");
  const [attempted, setAttempted] = useState(false);
  const keys = requiredDocs(app.business);
  const files = app.documents.files;
  const ready = keys.every((k) => files[k]?.status === "done");
  const doneCount = keys.filter((k) => files[k]?.status === "done").length;
  const uploading = keys.some((k) => files[k]?.status === "uploading");

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        if (ready) next();
      }}
    >
      <StepLayout
        step="documents"
        title="Upload your documents"
        description={`${keys.length} documents. Photos from your phone are fine — uploads continue from where they stopped if your connection drops.`}
        onBack={() => go("loan")}
        actions={
          <>
            {!editing && (
              <Button variant="ghost" aria-label="Back" iconLeft={<ArrowLeft aria-hidden className="size-4" />} onClick={() => go("loan")}>
                <span className="max-sm:sr-only">Back</span>
              </Button>
            )}
            <Button type="submit" iconRight={<ArrowRight aria-hidden className="size-4" />} className="max-lg:flex-1" disabled={uploading}>
              {uploading ? "Uploading…" : nextLabel}
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-raised px-4 py-3">
          <p className="flex items-center gap-2 text-small text-fg-muted">
            <Lock aria-hidden className="size-4" /> Encrypted and used only to review your application
          </p>
          <p className="shrink-0 text-small font-medium text-fg tabular">
            {doneCount} of {keys.length}
          </p>
        </div>
        {attempted && !ready && !uploading && (
          <p role="alert" className="flex items-center gap-2 rounded-md bg-danger-bg px-4 py-3 text-small text-danger-fg">
            <CircleAlert aria-hidden className="size-4 shrink-0" /> Upload the documents marked below to continue. You can save and come back to it.
          </p>
        )}
        {keys.map((k) => (
          <UploadTile key={k} docKey={k} missing={attempted && files[k]?.status !== "done"} />
        ))}
      </StepLayout>
    </form>
  );
}
