import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import {
  EMPTY_APPLICATION,
  SMART_DEFAULTS,
  stepIndex,
  type Application,
  type Business,
  type Consent,
  type DocKey,
  type Loan,
  type StepId,
  type UploadedDoc,
} from "./application";

// `?profile=name` keeps separate drafts side by side (handy for demos and QA in one browser).
const profile = new URLSearchParams(window.location.search).get("profile");
const STORAGE_KEY = `shecluded.loan-application.v1${profile ? `.${profile}` : ""}`;

type Action =
  | { type: "hydrate"; app: Application }
  | { type: "go"; step: Application["step"] }
  | { type: "business"; patch: Partial<Business> }
  | { type: "loan"; patch: Partial<Loan> }
  | { type: "idType"; value: string }
  | { type: "file"; key: DocKey; doc: UploadedDoc | undefined }
  | { type: "consent"; patch: Partial<Consent> }
  | { type: "submit"; reference: string }
  | { type: "saved"; at: number }
  | { type: "reset" };

function reducer(state: Application, action: Action): Application {
  switch (action.type) {
    case "hydrate":
      return action.app;
    case "go": {
      const i = action.step === "start" || action.step === "submitted" ? -1 : stepIndex(action.step);
      return { ...state, step: action.step, furthestStep: Math.max(state.furthestStep, i) };
    }
    case "business": {
      const business = { ...state.business, ...action.patch };
      // Smart defaults: when the category changes, pre-fill loan answers the applicant hasn't chosen yet.
      const category = action.patch.category;
      if (category && category !== state.business.category && !state.loanTouched) {
        const d = SMART_DEFAULTS[category];
        return { ...state, business, loan: { ...state.loan, purpose: d.purpose, durationMonths: d.durationMonths } };
      }
      return { ...state, business };
    }
    case "loan":
      return { ...state, loan: { ...state.loan, ...action.patch }, loanTouched: true };
    case "idType":
      return { ...state, documents: { ...state.documents, idType: action.value } };
    case "file": {
      const files = { ...state.documents.files };
      if (action.doc) files[action.key] = action.doc;
      else delete files[action.key];
      return { ...state, documents: { ...state.documents, files } };
    }
    case "consent":
      return { ...state, consent: { ...state.consent, ...action.patch } };
    case "submit":
      return { ...state, step: "submitted", reference: action.reference };
    case "saved":
      return { ...state, savedAt: action.at };
    case "reset":
      return EMPTY_APPLICATION;
  }
}

function load(): Application | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const app = JSON.parse(raw) as Application;
    // An upload can't survive a reload; surface it as interrupted so the applicant can retry.
    for (const doc of Object.values(app.documents.files)) {
      if (doc?.status === "uploading") {
        doc.status = "failed";
        doc.error = "This upload was interrupted. Try again and we'll continue from where it stopped.";
      }
    }
    return app;
  } catch {
    return null;
  }
}

function persist(app: Application) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(app));
    return true;
  } catch {
    return false;
  }
}

export type SaveState = "idle" | "saving" | "saved";

type Store = {
  app: Application;
  hasDraft: boolean;
  saveState: SaveState;
  weakNetwork: boolean;
  setWeakNetwork: (v: boolean) => void;
  go: (step: Application["step"]) => void;
  updateBusiness: (patch: Partial<Business>) => void;
  updateLoan: (patch: Partial<Loan>) => void;
  setIdType: (value: string) => void;
  setFile: (key: DocKey, doc: UploadedDoc | undefined) => void;
  updateConsent: (patch: Partial<Consent>) => void;
  saveAndExit: () => void;
  submit: () => void;
  reset: () => void;
  /** Where "Back to review" should return to after editing a section. */
  returnTo: StepId | null;
  setReturnTo: (s: StepId | null) => void;
  toast: string | null;
  dismissToast: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => load());
  const [app, dispatch] = useReducer(reducer, initial ? { ...initial, step: "start" } : EMPTY_APPLICATION);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [weakNetwork, setWeakNetwork] = useState(false);
  const [returnTo, setReturnTo] = useState<StepId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const firstRender = useRef(true);

  // Autosave: debounce writes so typing doesn't thrash storage.
  const fingerprint = JSON.stringify({ ...app, savedAt: null });
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (app.furthestStep < 0) return;
    setSaveState("saving");
    const t = window.setTimeout(() => {
      const at = Date.now();
      persist({ ...app, savedAt: at });
      dispatch({ type: "saved", at });
      setSaveState("saved");
    }, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint]);

  const go = useCallback((step: Application["step"]) => {
    dispatch({ type: "go", step });
    window.scrollTo({ top: 0 });
  }, []);

  const saveAndExit = useCallback(() => {
    const at = Date.now();
    persist({ ...app, savedAt: at });
    dispatch({ type: "saved", at });
    setSaveState("saved");
    setReturnTo(null);
    dispatch({ type: "go", step: "start" });
    setToast("Progress saved. Come back anytime on this device.");
    window.scrollTo({ top: 0 });
  }, [app]);

  const submit = useCallback(() => {
    const reference = `SHE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    dispatch({ type: "submit", reference });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable: nothing to clear */
    }
    window.scrollTo({ top: 0 });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    dispatch({ type: "reset" });
    setSaveState("idle");
  }, []);

  const store = useMemo<Store>(
    () => ({
      app,
      hasDraft: app.furthestStep >= 0,
      saveState,
      weakNetwork,
      setWeakNetwork,
      go,
      updateBusiness: (patch) => dispatch({ type: "business", patch }),
      updateLoan: (patch) => dispatch({ type: "loan", patch }),
      setIdType: (value) => dispatch({ type: "idType", value }),
      setFile: (key, doc) => dispatch({ type: "file", key, doc }),
      updateConsent: (patch) => dispatch({ type: "consent", patch }),
      saveAndExit,
      submit,
      reset,
      returnTo,
      setReturnTo,
      toast,
      dismissToast,
    }),
    [app, saveState, weakNetwork, go, saveAndExit, submit, reset, returnTo, toast, dismissToast],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useApplication() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useApplication must be used inside ApplicationProvider");
  return store;
}
