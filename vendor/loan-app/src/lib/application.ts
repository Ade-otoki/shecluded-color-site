import { z } from "zod";

/* ---------- Steps ---------- */

/**
 * Seconds per step for a typical applicant, from the KLM model in scripts/completion-time.mjs
 * (registered businesses also enter a CAC number and upload a certificate). Re-run it when a step changes.
 */
export const STEPS = [
  { id: "business", name: "Your business", short: "Business", seconds: { registered: 121, unregistered: 95 } },
  { id: "loan", name: "Your loan", short: "Loan", seconds: { registered: 87, unregistered: 87 } },
  { id: "documents", name: "Documents", short: "Documents", seconds: { registered: 97, unregistered: 81 } },
  { id: "review", name: "Review", short: "Review", seconds: { registered: 34, unregistered: 34 } },
  { id: "consent", name: "Consent", short: "Consent", seconds: { registered: 38, unregistered: 38 } },
] as const;

export type StepId = (typeof STEPS)[number]["id"];
type Step = (typeof STEPS)[number];

export const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id);

/** `registered` is unknown until step 1 is answered; assume the longer path so we never under-promise. */
const secondsFor = (s: Step, registered?: string) => (registered === "no" ? s.seconds.unregistered : s.seconds.registered);

export const stepMinutes = (s: Step, registered?: string) => Math.max(1, Math.round(secondsFor(s, registered) / 60));

/** Minutes remaining from the start of `id`, inclusive. Rounded up so we never under-promise. */
export const minutesLeft = (id: StepId, registered?: string) =>
  Math.max(1, Math.ceil(STEPS.slice(stepIndex(id)).reduce((sum, s) => sum + secondsFor(s, registered), 0) / 60));

export const totalMinutes = (registered?: string) => minutesLeft("business", registered);

/* ---------- Options ---------- */

export const CATEGORIES = [
  { value: "retail", label: "Retail and trading" },
  { value: "food", label: "Food and catering" },
  { value: "fashion", label: "Fashion and tailoring" },
  { value: "beauty", label: "Beauty and personal care" },
  { value: "agriculture", label: "Agriculture and agro-processing" },
  { value: "education", label: "Education and childcare" },
  { value: "health", label: "Health and pharmacy" },
  { value: "services", label: "Professional services" },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];

export const STATES = [
  "Lagos", "Abuja (FCT)", "Ogun", "Oyo", "Rivers", "Kano", "Kaduna",
  "Enugu", "Anambra", "Delta", "Edo", "Kwara", "Plateau", "Another state",
] as const;

export const YEARS = [
  { value: "lt1", label: "Under 1 year" },
  { value: "1-2", label: "1–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5+", label: "Over 5 years" },
] as const;

export const REVENUE = [
  { value: "lt250k", label: "Under ₦250,000" },
  { value: "250k-1m", label: "₦250,000 – ₦1m" },
  { value: "1m-5m", label: "₦1m – ₦5m" },
  { value: "5m+", label: "Over ₦5m" },
] as const;

export const EMPLOYEES = [
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2–5" },
  { value: "6-20", label: "6–20" },
  { value: "21+", label: "21+" },
] as const;

export const PURPOSES = [
  { value: "inventory", label: "Buy stock", description: "Restock goods or raw materials" },
  { value: "equipment", label: "Buy equipment", description: "Machines, tools, a vehicle or a freezer" },
  { value: "working_capital", label: "Run the business", description: "Rent, salaries or paying suppliers" },
  { value: "expansion", label: "Grow or expand", description: "A new location, product or market" },
] as const;
export type Purpose = (typeof PURPOSES)[number]["value"];

export const DURATIONS = [3, 6, 9, 12] as const;

export const FREQUENCIES = [
  { value: "monthly", label: "Monthly", perMonth: 1 },
  { value: "biweekly", label: "Every 2 weeks", perMonth: 2 },
] as const;

export const REPAYMENT_METHODS = [
  { value: "direct_debit", label: "Direct debit", description: "Paid automatically from your bank account on the due date" },
  { value: "transfer", label: "Bank transfer", description: "You send each payment yourself before the due date" },
  { value: "card", label: "Debit card", description: "Charged to a saved debit card on the due date" },
] as const;

export const ID_TYPES = [
  { value: "nin", label: "NIN slip" },
  { value: "voters", label: "Voter's card" },
  { value: "passport", label: "International passport" },
  { value: "drivers", label: "Driver's licence" },
] as const;

export const LOAN_MIN = 100_000;
export const LOAN_MAX = 5_000_000;
export const LOAN_STEP = 50_000;

/** Illustrative flat monthly rate for the prototype. Not Shecluded's real pricing. */
export const MONTHLY_RATE = 0.03;

/* ---------- Smart defaults ---------- */

type Defaults = { purpose: Purpose; durationMonths: (typeof DURATIONS)[number]; reason: string };

export const SMART_DEFAULTS: Record<Category, Defaults> = {
  retail: { purpose: "inventory", durationMonths: 6, reason: "Most retail businesses use loans to restock." },
  food: { purpose: "inventory", durationMonths: 3, reason: "Food businesses usually restock in short cycles." },
  fashion: { purpose: "equipment", durationMonths: 6, reason: "Fashion businesses often invest in machines." },
  beauty: { purpose: "inventory", durationMonths: 6, reason: "Beauty businesses usually restock products." },
  agriculture: { purpose: "equipment", durationMonths: 12, reason: "A longer term fits seasonal harvest income." },
  education: { purpose: "expansion", durationMonths: 12, reason: "Schools often borrow to add classrooms or terms." },
  health: { purpose: "inventory", durationMonths: 6, reason: "Pharmacies usually restock medicines." },
  services: { purpose: "working_capital", durationMonths: 6, reason: "Service businesses often cover gaps in cash flow." },
};

/* ---------- Schemas ---------- */

const required = (label: string) => ({ errorMap: () => ({ message: `Choose ${label}` }) });

export const businessSchema = z
  .object({
    businessName: z.string().trim().min(2, "Enter your business name"),
    category: z.enum(CATEGORIES.map((c) => c.value) as [Category, ...Category[]], required("a category")),
    state: z.string().min(1, "Choose a state"),
    address: z.string().trim().min(5, "Enter the street address where you trade"),
    years: z.enum(YEARS.map((y) => y.value) as [string, ...string[]], required("how long you've been trading")),
    registered: z.enum(["yes", "no"], required("an answer")),
    registrationNumber: z.string().trim().optional(),
    revenue: z.enum(REVENUE.map((r) => r.value) as [string, ...string[]], required("a revenue range")),
    employees: z.enum(EMPLOYEES.map((e) => e.value) as [string, ...string[]], required("a team size")),
  })
  .superRefine((v, ctx) => {
    if (v.registered === "yes" && !/^(RC|BN)\s?\d{4,8}$/i.test(v.registrationNumber ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationNumber"],
        message: "Enter your CAC number, for example RC 1234567 or BN 1234567",
      });
    }
  });
export type Business = z.infer<typeof businessSchema>;

export const loanSchema = z.object({
  amount: z.number().min(LOAN_MIN, "The smallest loan is ₦100,000").max(LOAN_MAX, "The largest loan is ₦5,000,000"),
  purpose: z.enum(PURPOSES.map((p) => p.value) as [Purpose, ...Purpose[]], required("what the loan is for")),
  durationMonths: z.number(),
  frequency: z.enum(["monthly", "biweekly"]),
  repaymentMethod: z.enum(["direct_debit", "transfer", "card"], required("how you'll repay")),
});
export type Loan = z.infer<typeof loanSchema>;

export type UploadStatus = "uploading" | "failed" | "done";
export type DocKey = "id" | "statement" | "cac";

export type UploadedDoc = {
  name: string;
  sizeBytes: number;
  status: UploadStatus;
  progress: number;
  error?: string;
  /** Network failures can resume; invalid files can't. */
  retryable?: boolean;
  attempts?: number;
};

export type Documents = {
  idType: string;
  files: Partial<Record<DocKey, UploadedDoc>>;
};

export type Consent = { verify: boolean; terms: boolean; repayment: boolean };

export type Application = {
  step: StepId | "start" | "submitted";
  business: Partial<Business>;
  loan: Partial<Loan>;
  documents: Documents;
  consent: Consent;
  furthestStep: number;
  loanTouched?: boolean;
  savedAt: number | null;
  reference?: string;
};

export const EMPTY_APPLICATION: Application = {
  step: "start",
  business: {},
  loan: { amount: 500_000, frequency: "monthly", durationMonths: 6 },
  documents: { idType: "nin", files: {} },
  consent: { verify: false, terms: false, repayment: false },
  furthestStep: -1,
  savedAt: null,
};

/* ---------- Documents ---------- */

export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_BYTES = 10 * 1024 * 1024;

export function requiredDocs(business: Partial<Business>): DocKey[] {
  return business.registered === "yes" ? ["id", "statement", "cac"] : ["id", "statement"];
}

/* ---------- Money ---------- */

export function repayment(loan: Pick<Loan, "amount" | "durationMonths" | "frequency">) {
  const perMonth = FREQUENCIES.find((f) => f.value === loan.frequency)?.perMonth ?? 1;
  const installments = loan.durationMonths * perMonth;
  const interest = Math.round(loan.amount * MONTHLY_RATE * loan.durationMonths);
  const total = loan.amount + interest;
  return { installments, interest, total, perInstallment: Math.ceil(total / installments) };
}

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
export const formatNaira = (n: number) => naira.format(n).replace("NGN", "₦").replace(/\s/g, "");

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const labelOf = <T extends { value: string; label: string }>(list: readonly T[], value?: string) =>
  list.find((o) => o.value === value)?.label ?? "—";
