"use client";

import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { ConnectedSuccess } from "@/components/forms/ConnectedSuccess";
import { errorText, summaryText, type FormCopy } from "@/components/forms/copy";
import { ErrorSummary } from "@/components/forms/ErrorSummary";
import { describedBy, Field, inputClass } from "@/components/forms/Field";
import { Honeypot, TrackingFields } from "@/components/forms/Hidden";
import { Turnstile } from "@/components/forms/Turnstile";
import { ClientButton as Button } from "@/components/ui/ClientButton";
import { initialFormState, type FormState } from "@/lib/forms/types";
import { cx as cn } from "@/lib/cx";
import { submitContact } from "./actions";
import { BUDGETS, DEPARTMENTS, SOURCES, TIMELINES, type ContactInput } from "./options";

// Validation code (zod + resolver, ~12 KB) loads on first interaction, not with
// the page (ADR-007 budget). The server validates every submission regardless.
const loadValidation = () =>
  Promise.all([import("@hookform/resolvers/zod"), import("./schema")]).then(
    ([{ zodResolver }, { contactSchema }]) => zodResolver(contactSchema),
  );
let validation: ReturnType<typeof loadValidation> | undefined;
const lazyResolver: Resolver<ContactInput> = async (values, context, options) =>
  ((await (validation ??= loadValidation())) as unknown as Resolver<ContactInput>)(
    values,
    context,
    options,
  );

export type ContactFormCopy = FormCopy & {
  fields: Record<string, string>;
  departments: Record<string, string>;
  budgets: Record<string, string>;
  timelines: Record<string, string>;
  sources: Record<string, string>;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  marketing: string;
  privacyHref: string;
  connectedTitle: string;
  connectedBody: string;
  reference: string;
  sendAnother: string;
  moreDetails: string;
  sooner: string;
  bookCall: string;
  bookHref: string;
  choose: string;
};

type Option = { value: string; label: string };

const FIELD_ORDER = [
  "department",
  "name",
  "email",
  "company",
  "country",
  "phone",
  "services",
  "budgetRange",
  "timeline",
  "message",
  "source",
  "consent",
];

/**
 * Project inquiry / contact form (FR-CON-01/02). Works without JavaScript: the
 * form posts straight to the server action and the page re-renders with the
 * result. With JS, React Hook Form validates the same zod schema first.
 */
export function ContactForm({
  copy,
  locale,
  countries,
  callingCodes,
  services,
  defaultDepartment = "sales",
  turnstileSiteKey,
  product,
}: {
  copy: ContactFormCopy;
  locale: string;
  countries: Option[];
  callingCodes: { code: string; dial: string }[];
  services: Option[];
  defaultDepartment?: (typeof DEPARTMENTS)[number];
  turnstileSiteKey?: string;
  /** Product demo mode (FR-PRD-02): fixed to sales, no department or service choice. */
  product?: { slug: string; name: string };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    submitContact,
    initialFormState,
  );
  const [dismissed, setDismissed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const serverValues = state.values ?? {};
  const initialDepartment =
    (serverValues.department as ContactInput["department"]) ?? defaultDepartment;
  const initialServices = (serverValues.services as string[] | undefined) ?? [];
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: lazyResolver,
    // Validate on Continue/Send, re-check while typing — never on blur, which would move
    // the button between mouse-down and mouse-up when an error message disappears.
    mode: "onSubmit",
    reValidateMode: "onChange",
    // FR-FORM-02: focus goes to the error summary, not the first field.
    shouldFocusError: false,
    defaultValues: {
      department: initialDepartment,
      phoneCountry: (serverValues.phoneCountry as string) ?? "RW",
      services: initialServices,
      consent: undefined,
    },
  });

  // Server-side errors (e.g. phone normalisation, rate limit) flow into RHF.
  useEffect(() => {
    if (state.status !== "error") return;
    for (const [field, code] of Object.entries(state.fieldErrors ?? {})) {
      setError(field as keyof ContactInput, { type: "server", message: code });
    }
    setSummaryNames(FIELD_ORDER.filter((f) => state.fieldErrors && f in state.fieldErrors));
    setFocusSummary((n) => n + 1);
  }, [state, setError]);

  // ?topic=academy (etc.) preselects a department, and ?service=ai-data a service
  // (the optional panel opens to show it) — read here so the page stays static.
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    if (topic && (DEPARTMENTS as readonly string[]).includes(topic) && !state.values) {
      setValue("department", topic as ContactInput["department"]);
    }
    const service = params.get("service");
    if (service && services.some((o) => o.value === service) && !state.values) {
      setValue("department", "sales");
      setValue("services", [service]);
      if (detailsRef.current) detailsRef.current.open = true;
    }
  }, [setValue, state.values, services]);

  const department = watch("department") ?? initialDepartment;
  const isSales = department === "sales";

  // RHF errors once hydrated; server errors otherwise, so a no-JS re-render shows them too.
  const hasClientErrors = Object.keys(errors).length > 0;
  const codeFor = (name: string): string | undefined =>
    (errors[name as keyof ContactInput]?.message as string | undefined) ??
    (hasClientErrors ? undefined : state.fieldErrors?.[name]);

  // Snapshot of the last attempt, so fixing errors doesn't collapse the summary mid-click.
  const [summaryNames, setSummaryNames] = useState<string[] | null>(null);
  // Focus the summary after React has rendered it (rAF can run before the commit).
  const [focusSummary, setFocusSummary] = useState(0);
  useEffect(() => {
    if (focusSummary) summaryRef.current?.focus();
  }, [focusSummary]);
  const summaryFor = summaryNames ?? (hasClientErrors ? [] : FIELD_ORDER);
  const errorList = useMemo(
    () =>
      summaryFor
        .filter((f) => codeFor(f))
        .map((f) => ({
          id:
            f === "department"
              ? `contact-department-${DEPARTMENTS[0]}`
              : f === "services"
                ? "contact-services"
                : `contact-${f}`,
          text: `${copy.fields[f] ?? ""}: ${errorText(copy, codeFor(f))}`,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- codeFor derives from these
    [errors, copy, state.fieldErrors, summaryNames],
  );

  if (state.status === "success" && !dismissed) {
    return (
      <ConnectedSuccess
        title={copy.connectedTitle}
        body={copy.connectedBody}
        reference={state.ref ? copy.reference.replace("{ref}", state.ref) : undefined}
        againLabel={copy.sendAnother}
        next={{ prompt: copy.sooner, label: copy.bookCall, href: copy.bookHref }}
        onAgain={() => {
          reset();
          setDismissed(true);
        }}
      />
    );
  }

  const err = (name: keyof ContactInput) => errorText(copy, codeFor(name));
  // The optional panel opens itself when it holds something: a value sent back
  // by the server, a preselected service, or an error to fix.
  const optionalNames = [
    "company",
    "country",
    "phone",
    "budgetRange",
    "timeline",
    "source",
  ] as const;
  const detailsOpen =
    optionalNames.some((n) => Boolean(serverValues[n])) ||
    initialServices.length > 0 ||
    Boolean(err("phone"));
  const formError =
    state.formError === "rateLimited"
      ? copy.rateLimited
      : state.formError === "botCheckFailed"
        ? copy.botCheckFailed
        : state.formError === "generic"
          ? copy.genericError
          : undefined;

  const text = (
    name: keyof ContactInput,
    opts: {
      label: string;
      type?: string;
      required?: boolean;
      autoComplete?: string;
      hint?: string;
      className?: string;
    },
  ) => {
    const id = `contact-${name}`;
    const e = err(name);
    return (
      <Field
        id={id}
        label={opts.label}
        required={opts.required}
        optionalLabel={copy.optional}
        hint={opts.hint}
        error={e}
        className={opts.className}
      >
        <input
          id={id}
          type={opts.type ?? "text"}
          autoComplete={opts.autoComplete}
          aria-invalid={e ? true : undefined}
          aria-required={opts.required || undefined}
          aria-describedby={describedBy(id, { hint: opts.hint, error: e })}
          defaultValue={(serverValues[name] as string) ?? ""}
          className={cn(inputClass, "h-12")}
          {...register(name)}
        />
      </Field>
    );
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onFocusCapture={() => void (validation ??= loadValidation())}
      onSubmit={(event) => {
        // With JS: validate with RHF first, then submit the real FormData.
        event.preventDefault();
        handleSubmit(
          () => {
            setDismissed(false);
            setSummaryNames(null);
            startTransition(() => formAction(new FormData(formRef.current!)));
          },
          (errs) => {
            setSummaryNames(FIELD_ORDER.filter((f) => f in errs));
            setFocusSummary((n) => n + 1);
          },
        )(event);
      }}
      className="relative space-y-6"
    >
      <ErrorSummary
        ref={summaryRef}
        title={summaryText(copy, errorList.length)}
        errors={errorList}
        formError={formError}
      />

      {product && (
        // The hidden department radios stay on "sales" (the default) in product mode.
        <input type="hidden" name="product" value={product.slug} />
      )}
      <fieldset hidden={Boolean(product)}>
        <legend className="mb-3 text-body-sm font-medium">{copy.fields.department}</legend>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((d) => (
            <label key={d} className="chip">
              <input
                id={`contact-department-${d}`}
                type="radio"
                value={d}
                defaultChecked={d === initialDepartment}
                className="chip__input peer"
                {...register("department")}
              />
              <span className="chip__body">
                <Check aria-hidden className="chip__check" />
                {copy.departments[d]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {text("name", { label: copy.fields.name!, required: true, autoComplete: "name" })}
        {text("email", {
          label: isSales ? copy.fields.workEmail! : copy.fields.email!,
          type: "email",
          required: true,
          autoComplete: "email",
        })}
      </div>

      <Field
        id="contact-message"
        label={copy.fields.message}
        required
        hint={copy.fields.messageHint}
        error={err("message")}
      >
        <textarea
          id="contact-message"
          rows={6}
          aria-invalid={err("message") ? true : undefined}
          aria-required
          aria-describedby={describedBy("contact-message", { hint: true, error: err("message") })}
          defaultValue={(serverValues.message as string) ?? ""}
          className={cn(inputClass, "min-h-36 resize-y py-3")}
          {...register("message")}
        />
      </Field>

      {/* Short by default (audit v2 U-3): only what we need to reply is visible. */}
      <details
        ref={detailsRef}
        className="group/details rounded-lg border border-subtle"
        open={detailsOpen}
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 font-medium [&::-webkit-details-marker]:hidden">
          {copy.moreDetails}
          <ChevronDown
            aria-hidden
            className="size-4 transition-transform group-open/details:rotate-180"
          />
        </summary>
        <div className="space-y-5 border-t border-subtle p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {text("company", { label: copy.fields.company!, autoComplete: "organization" })}
            <Field id="contact-country" label={copy.fields.country} optionalLabel={copy.optional}>
              <select
                id="contact-country"
                autoComplete="country"
                defaultValue={(serverValues.country as string) ?? ""}
                className={cn(inputClass, "h-12 appearance-none pr-10! select-chevron")}
                {...register("country")}
              >
                <option value="">{copy.choose}</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              id="contact-phone"
              label={copy.fields.phone}
              optionalLabel={copy.optional}
              error={err("phone")}
              className="sm:col-span-2"
            >
              <div className="flex gap-2">
                <select
                  aria-label={`${copy.fields.phone} — country code`}
                  className={cn(
                    inputClass,
                    "h-12 w-28! shrink-0 appearance-none pr-2! select-chevron",
                  )}
                  defaultValue={(serverValues.phoneCountry as string) ?? "RW"}
                  {...register("phoneCountry")}
                >
                  {callingCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} {c.dial}
                    </option>
                  ))}
                </select>
                <input
                  id="contact-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  aria-invalid={err("phone") ? true : undefined}
                  aria-describedby={describedBy("contact-phone", { error: err("phone") })}
                  defaultValue={(serverValues.phone as string) ?? ""}
                  className={cn(inputClass, "h-12")}
                  {...register("phone")}
                />
              </div>
            </Field>
          </div>
          {isSales && !product && (
            <div className="space-y-5 rounded-lg border border-subtle bg-sunken/50 p-5">
              {services.length > 0 && (
                <fieldset id="contact-services" tabIndex={-1}>
                  <legend className="mb-3 text-body-sm font-medium">
                    {copy.fields.services}{" "}
                    <span className="font-normal text-fg-muted">({copy.optional})</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <label key={s.value} className="chip">
                        <input
                          type="checkbox"
                          value={s.value}
                          defaultChecked={initialServices.includes(s.value)}
                          className="chip__input peer"
                          {...register("services")}
                        />
                        <span className="chip__body">
                          <Check aria-hidden className="chip__check" />
                          {s.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="contact-budgetRange"
                  label={copy.fields.budget}
                  optionalLabel={copy.optional}
                >
                  <select
                    id="contact-budgetRange"
                    defaultValue={(serverValues.budgetRange as string) ?? ""}
                    className={cn(inputClass, "h-12 appearance-none pr-10! select-chevron")}
                    {...register("budgetRange")}
                  >
                    <option value="">{copy.choose}</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {copy.budgets[b]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  id="contact-timeline"
                  label={copy.fields.timeline}
                  optionalLabel={copy.optional}
                >
                  <select
                    id="contact-timeline"
                    defaultValue={(serverValues.timeline as string) ?? ""}
                    className={cn(inputClass, "h-12 appearance-none pr-10! select-chevron")}
                    {...register("timeline")}
                  >
                    <option value="">{copy.choose}</option>
                    {TIMELINES.map((b) => (
                      <option key={b} value={b}>
                        {copy.timelines[b]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}
          <Field id="contact-source" label={copy.fields.source} optionalLabel={copy.optional}>
            <select
              id="contact-source"
              defaultValue={(serverValues.source as string) ?? ""}
              className={cn(inputClass, "h-12 appearance-none pr-10! select-chevron")}
              {...register("source")}
            >
              <option value="">{copy.choose}</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {copy.sources[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </details>

      <div className="space-y-3">
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-body-sm">
            {/* FR-FORM-04: explicit, unticked consent */}
            <input
              id="contact-consent"
              type="checkbox"
              aria-invalid={err("consent") ? true : undefined}
              aria-describedby={err("consent") ? "contact-consent-error" : undefined}
              className="mt-0.5 size-5 shrink-0 accent-accent"
              {...register("consent")}
            />
            <span>
              {copy.consentBefore}
              <a
                href={copy.privacyHref}
                target="_blank"
                className="font-medium text-accent underline underline-offset-4"
              >
                {copy.consentLink}
              </a>
              {copy.consentAfter}
              <span aria-hidden className="ml-0.5 text-danger">
                *
              </span>
            </span>
          </label>
          {err("consent") && (
            <p
              id="contact-consent-error"
              className="mt-1.5 ml-8 text-body-sm font-medium text-danger"
            >
              {err("consent")}
            </p>
          )}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-body-sm text-fg-secondary">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 accent-accent"
            {...register("marketing")}
          />
          <span>{copy.marketing}</span>
        </label>
      </div>

      <Honeypot />
      <TrackingFields locale={locale} />
      <Turnstile siteKey={turnstileSiteKey} locale={locale} />

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? copy.submitting : copy.submit}
        {!pending && <ArrowRight aria-hidden data-arrow />}
      </Button>
    </form>
  );
}
