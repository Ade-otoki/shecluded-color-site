import { useCallback } from "react";
import type { StepId } from "../lib/application";
import { useApplication } from "../lib/store";

/** Forward navigation that returns to Review when the applicant came from an Edit link. */
export function useStepNav(current: StepId, nextStep: StepId, label: string) {
  const { go, returnTo, setReturnTo } = useApplication();
  const editing = returnTo !== null && returnTo !== current;
  const next = useCallback(() => {
    if (editing && returnTo) {
      setReturnTo(null);
      go(returnTo);
    } else go(nextStep);
  }, [editing, returnTo, setReturnTo, go, nextStep]);
  return { next, nextLabel: editing ? "Save and back to review" : label, editing };
}
