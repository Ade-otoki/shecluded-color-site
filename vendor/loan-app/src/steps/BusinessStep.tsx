import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, EMPLOYEES, REVENUE, STATES, YEARS, businessSchema, type Business } from "../lib/application";
import { useApplication } from "../lib/store";
import { useStepNav } from "./useStepNav";
import { StepLayout } from "../components/flow/Shell";
import { Field } from "../components/ui/Field";
import { Input, Select } from "../components/ui/Input";
import { Chips } from "../components/ui/Choice";
import { Card } from "../components/ui/Surface";
import { Button } from "../components/ui/Button";

export function BusinessStep() {
  const { app, updateBusiness, go } = useApplication();
  const { next, nextLabel } = useStepNav("business", "loan", "Continue to your loan");
  const form = useForm<Business>({
    resolver: zodResolver(businessSchema),
    defaultValues: { registrationNumber: "", ...app.business } as Business,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, watch, formState } = form;
  const { errors } = formState;

  // Autosave every change to the store.
  useEffect(() => {
    const sub = watch((values, { name }) => {
      if (name) updateBusiness({ [name]: values[name as keyof Business] } as Partial<Business>);
    });
    return () => sub.unsubscribe();
  }, [watch, updateBusiness]);

  const registered = watch("registered");

  return (
    <form noValidate onSubmit={handleSubmit(next)}>
      <StepLayout
        step="business"
        title="Tell us about your business"
        description="Start with the basics. Your answers here pre-fill the next step."
        onBack={() => go("start")}
        actions={
          <>
            <span className="max-lg:hidden" />
            <Button type="submit" iconRight={<ArrowRight aria-hidden className="size-4" />} className="max-lg:flex-1">
              {nextLabel}
            </Button>
          </>
        }
      >
        <Card eyebrow="About the business">
          <div className="flex flex-col gap-6">
            <Field label="Business name" hint="As customers or your bank know it" error={errors.businessName?.message}>
              <Input autoComplete="organization" placeholder="e.g. Adaeze Fabrics" {...register("businessName")} />
            </Field>
            <Field label="What does your business do?" hint="We use this to suggest loan options that fit" error={errors.category?.message}>
              <Select placeholder="Choose a category" defaultValue="" {...register("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="How long have you been trading?" as="group" error={errors.years?.message}>
              <Controller
                control={control}
                name="years"
                render={({ field }) => <Chips name="years" options={YEARS} value={field.value} onChange={field.onChange} invalid={!!errors.years} />}
              />
            </Field>
          </div>
        </Card>

        <Card eyebrow="Where you trade">
          <div className="flex flex-col gap-6">
            <Field label="State" error={errors.state?.message}>
              <Select placeholder="Choose a state" defaultValue="" autoComplete="address-level1" {...register("state")}>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Business address" hint="Shop, stall or office. Home is fine if you work from home" error={errors.address?.message}>
              <Input autoComplete="street-address" placeholder="e.g. 14 Balogun Street, Lagos Island" {...register("address")} />
            </Field>
          </div>
        </Card>

        <Card eyebrow="Size and registration">
          <div className="flex flex-col gap-6">
            <Field label="Is your business registered with CAC?" as="group" error={errors.registered?.message}>
              <Controller
                control={control}
                name="registered"
                render={({ field }) => (
                  <Chips
                    name="registered"
                    options={[
                      { value: "yes", label: "Yes, it's registered" },
                      { value: "no", label: "Not yet" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.registered}
                  />
                )}
              />
            </Field>
            {registered === "yes" && (
              <Field label="CAC registration number" hint="Starts with RC or BN" error={errors.registrationNumber?.message}>
                <Input autoCapitalize="characters" placeholder="RC 1234567" {...register("registrationNumber")} />
              </Field>
            )}
            {registered === "no" && (
              <p className="rounded-sm bg-subtle px-4 py-3 text-small text-fg-muted">
                That's okay, you can still apply. You'll skip the CAC certificate in the documents step.
              </p>
            )}
            <Field
              label="Average monthly revenue"
              as="group"
              why="It helps us suggest an amount you can repay comfortably. We don't share it, and a range is enough."
              error={errors.revenue?.message}
            >
              <Controller
                control={control}
                name="revenue"
                render={({ field }) => <Chips name="revenue" options={REVENUE} value={field.value} onChange={field.onChange} invalid={!!errors.revenue} />}
              />
            </Field>
            <Field label="How many people work in the business?" hint="Include yourself" as="group" error={errors.employees?.message}>
              <Controller
                control={control}
                name="employees"
                render={({ field }) => <Chips name="employees" options={EMPLOYEES} value={field.value} onChange={field.onChange} invalid={!!errors.employees} />}
              />
            </Field>
          </div>
        </Card>
      </StepLayout>
    </form>
  );
}
