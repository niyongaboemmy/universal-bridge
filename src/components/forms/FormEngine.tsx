"use client";

import { ArrowLeft, ArrowRight, Check, FileText, Upload, X } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { ClientButton as Button } from "@/components/ui/ClientButton";
import { cx } from "@/lib/cx";
import { initialFormState, type FormState } from "@/lib/forms/types";
import { useLocalStorage } from "@/lib/hooks/client-stores";
import { ageOn } from "@/lib/time/age";
import { ConnectedSuccess } from "./ConnectedSuccess";
import { errorText, summaryText, type FormCopy } from "./copy";
import { schemaLoaders, type SchemaKey } from "./engine-schemas";
import { ErrorSummary } from "./ErrorSummary";
import { describedBy, Field, inputClass } from "./Field";
import { Honeypot, TrackingFields } from "./Hidden";
import { Turnstile } from "./Turnstile";

export type Option = { value: string; label: string };

export type EngineField = {
  name: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "url"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "phone";
  label: string;
  hint?: string;
  required?: boolean;
  options?: Option[];
  autoComplete?: string;
  rows?: number;
  /** Span both columns on wide screens. */
  full?: boolean;
  /** Show only when the applicant is under 18 (date field name) or another field equals a value. */
  showIf?: { under18: string } | { field: string; equals: string };
};

export type EngineStep = { id: string; title: string; fields: string[] };

export type EngineCopy = FormCopy & {
  next: string;
  back: string;
  review: string;
  reviewShort: string;
  reviewLead: string;
  edit: string;
  step: string;
  saved: string;
  restored: string;
  restore: string;
  discard: string;
  file: { choose: string; drop: string; types: string; remove: string; selected: string };
  successTitle: string;
  successBody: string;
  waitlistTitle: string;
  waitlistBody: string;
  reference: string;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  privacyHref: string;
  /** Academy forms: link to the Academy terms next to the consent. */
  terms?: { href: string; label: string };
  choose: string;
  under18: string;
};

const CONSENT = "consent";
const NO_DRAFT = new Set(["consent", "guardianConsent", "acceptsConditions"]);
const subscribeNoop = () => () => {};

function isVisible(field: EngineField, values: FieldValues) {
  if (!field.showIf) return true;
  if ("under18" in field.showIf) {
    const dob = values[field.showIf.under18];
    return typeof dob === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dob) && ageOn(dob) < 18;
  }
  return values[field.showIf.field] === field.showIf.equals;
}

/**
 * Data-driven, accessible form (FR-FORM-01…10) used by every application form.
 * - One zod schema per form, loaded lazily on first interaction.
 * - Steps with a trace progress indicator (UI/UX §12.10); each step validates before
 *   moving on. Without JavaScript all steps render as one form and still submit.
 * - Drafts autosave to this device (files and consents excluded) and can be restored.
 */
export function FormEngine({
  schemaKey,
  action,
  fields,
  steps,
  review = false,
  copy,
  locale,
  hidden = {},
  callingCodes = [],
  defaults = {},
  draftKey,
  turnstileSiteKey,
  submitLabel,
  idPrefix = "f",
  queryDefaults = [],
}: {
  schemaKey: SchemaKey;
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  fields: EngineField[];
  steps?: EngineStep[];
  review?: boolean;
  copy: EngineCopy;
  locale: string;
  hidden?: Record<string, string>;
  callingCodes?: { code: string; dial: string }[];
  defaults?: Record<string, string>;
  draftKey?: string;
  turnstileSiteKey?: string;
  submitLabel?: string;
  idPrefix?: string;
  /** Field names that may be preselected from the URL (e.g. ?intake=12); keeps pages static. */
  queryDefaults?: string[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    initialFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [step, setStep] = useState(0);
  const [dismissedDraft, setDismissedDraft] = useState(false);
  // Whether the visitor has typed in this session (RHF's isDirty also flips for
  // radio groups and checkboxes without defaults, which would hide the banner).
  const [edited, setEdited] = useState(false);
  // The error summary is a snapshot of the last attempt (GOV.UK pattern). If it
  // updated live, fixing the last error would collapse it on blur and move the
  // Continue/Send button out from under the pointer mid-click.
  const [summaryNames, setSummaryNames] = useState<string[] | null>(null);
  // Focus the summary after React has rendered it (rAF can run before the commit).
  const [focusSummary, setFocusSummary] = useState(0);
  useEffect(() => {
    if (focusSummary) summaryRef.current?.focus();
  }, [focusSummary]);
  const [draft, writeDraft] = useLocalStorage(draftKey ?? "ub-draft-none");

  const loader = useRef<Promise<Resolver<FieldValues>> | undefined>(undefined);
  const load = () =>
    (loader.current ??= Promise.all([
      import("@hookform/resolvers/zod"),
      schemaLoaders[schemaKey](),
    ]).then(
      ([{ zodResolver }, schema]) =>
        zodResolver(schema as never) as unknown as Resolver<FieldValues>,
    ));
  // Hidden inputs (e.g. the event id) aren't registered with RHF but are part of the schema.
  const resolver: Resolver<FieldValues> = async (values, context, options) =>
    (await load())({ ...hidden, ...values }, context, options);

  const serverValues = state.values ?? {};
  const initial = (name: string) =>
    (serverValues[name] as string | undefined) ?? defaults[name] ?? "";

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    getFieldState,
    setError,
    setValue,
    formState,
  } = useForm<FieldValues>({
    resolver,
    // Validate on Continue/Send, re-check while typing — never on blur, which would move
    // the button between mouse-down and mouse-up when an error message disappears.
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    // No text defaults here on purpose: React Hook Form would write them over the
    // DOM at hydration, wiping anything typed on a slow connection before the JS
    // arrived. Initial values are rendered as HTML defaultValue/defaultChecked
    // instead, and RHF adopts whatever is in the field when it registers.
  });
  const { errors } = formState;
  const values = watch();

  useEffect(() => {
    if (!queryDefaults.length || state.values) return;
    const params = new URLSearchParams(window.location.search);
    for (const name of queryDefaults) {
      const v = params.get(name);
      if (v) setValue(name, v, { shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  // Server errors → RHF, and jump to the first step that has one.
  useEffect(() => {
    if (state.status !== "error") return;
    for (const [field, code] of Object.entries(state.fieldErrors ?? {}))
      setError(field, { type: "server", message: code });
    setSummaryNames(Object.keys(state.fieldErrors ?? {}));
    setFocusSummary((n) => n + 1);
  }, [state, setError]);

  // Autosave (no React state involved).
  useEffect(() => {
    if (!draftKey) return;
    let timer: ReturnType<typeof setTimeout>;
    const sub = watch((v) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const safe = Object.fromEntries(
          Object.entries(v).filter(
            ([k, val]) => !NO_DRAFT.has(k) && typeof val === "string" && val !== "",
          ),
        );
        if (Object.keys(safe).some((k) => k !== "phoneCountry")) writeDraft(JSON.stringify(safe));
      }, 600);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [draftKey, watch, writeDraft]);

  useEffect(() => {
    if (state.status === "success" && draftKey) {
      try {
        localStorage.removeItem(draftKey);
      } catch {}
    }
  }, [state.status, draftKey]);

  const hasClientErrors = Object.keys(errors).length > 0;
  const codeFor = (name: string) =>
    (errors[name]?.message as string | undefined) ??
    (hasClientErrors ? undefined : state.fieldErrors?.[name]);
  // Read the latest RHF state (not the render-time snapshot) right after validating.
  const invalidNames = (names: string[]) => names.filter((n) => getFieldState(n).invalid);
  // Server errors render without JS too (no snapshot needed there).
  const summaryFor = summaryNames ?? (hasClientErrors ? [] : Object.keys(state.fieldErrors ?? {}));
  const errorList = summaryFor
    .map((name) => {
      const f = fields.find((x) => x.name === name);
      const code = codeFor(name) ?? (errors[name]?.message as string | undefined);
      if (!code) return null;
      return {
        id: `${idPrefix}-${name}`,
        text: f ? `${f.label}: ${errorText(copy, code)}` : errorText(copy, code)!,
      };
    })
    .filter(Boolean) as { id: string; text: string }[];

  function showSummary(names: string[] = [...fields.map((f) => f.name), CONSENT]) {
    setSummaryNames(invalidNames(names));
    setFocusSummary((n) => n + 1);
  }

  const totalSteps = steps ? steps.length + (review ? 1 : 0) : 1;
  const onReview = Boolean(steps && review && step === steps.length);
  const stepMode = Boolean(steps) && hydrated;

  if (state.status === "success") {
    return (
      <ConnectedSuccess
        title={state.waitlisted ? copy.waitlistTitle : copy.successTitle}
        body={state.waitlisted ? copy.waitlistBody : copy.successBody}
        reference={state.ref ? copy.reference.replace("{ref}", state.ref) : undefined}
      />
    );
  }

  const formError =
    state.formError === "rateLimited"
      ? copy.rateLimited
      : state.formError === "botCheckFailed"
        ? copy.botCheckFailed
        : state.formError === "generic"
          ? copy.genericError
          : undefined;

  /**
   * Required fields that only appear in some cases (e.g. guardian for under-18s).
   * Zod's object-level rules only run once every other field is valid, so a
   * step-by-step form checks these itself; the server re-checks everything.
   */
  function checkConditional(names: string[]) {
    let ok = true;
    const v = getValues();
    for (const f of fields) {
      if (!names.includes(f.name) || !f.required || !f.showIf || !isVisible(f, v)) continue;
      const value = v[f.name];
      const empty =
        f.type === "checkbox" ? !value : typeof value !== "string" || value.trim() === "";
      if (empty) {
        setError(f.name, {
          type: "conditional",
          message: "under18" in f.showIf ? "under18Guardian" : "required",
        });
        ok = false;
      }
    }
    return ok;
  }

  async function goNext() {
    if (!steps) return;
    void load();
    const current = steps[step]!.fields.filter((name) => {
      const f = fields.find((x) => x.name === name);
      return f && isVisible(f, getValues());
    });
    const valid = await trigger(current);
    const conditional = checkConditional(current);
    if (!valid || !conditional) {
      showSummary(current);
      return;
    }
    setSummaryNames(null);
    setStep((s) => s + 1);
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }

  function goTo(i: number) {
    setStep(i);
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }

  const renderField = (f: EngineField) => {
    const id = `${idPrefix}-${f.name}`;
    const e = errorText(copy, codeFor(f.name));
    const common = {
      id,
      "aria-invalid": e ? true : undefined,
      "aria-required": f.required || undefined,
      "aria-describedby": describedBy(id, { hint: f.hint, error: e }),
    } as const;
    const visible = isVisible(f, values);
    const wrap = (node: React.ReactNode) => (
      <Field
        key={f.name}
        id={id}
        label={f.label}
        required={f.required}
        optionalLabel={copy.optional}
        hint={f.hint}
        error={e}
        className={cx(f.full && "sm:col-span-2", !visible && "hidden")}
      >
        {node}
      </Field>
    );
    switch (f.type) {
      case "textarea":
        return wrap(
          <textarea
            {...common}
            defaultValue={initial(f.name)}
            rows={f.rows ?? 5}
            className={cx(inputClass, "min-h-32 resize-y py-3")}
            {...register(f.name)}
          />,
        );
      case "select":
        return wrap(
          <select
            {...common}
            defaultValue={initial(f.name)}
            className={cx(inputClass, "select-chevron h-12 appearance-none pr-10!")}
            {...register(f.name)}
          >
            <option value="">{copy.choose}</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>,
        );
      case "radio":
        return (
          <fieldset
            key={f.name}
            className={cx("sm:col-span-2", !visible && "hidden")}
            aria-describedby={e ? `${id}-error` : undefined}
          >
            <legend className="mb-3 text-body-sm font-medium">
              {f.label}
              {f.required && (
                <span aria-hidden className="ml-0.5 text-danger">
                  *
                </span>
              )}
            </legend>
            <div className="flex flex-wrap gap-2">
              {f.options?.map((o, i) => (
                <label key={o.value} className="chip">
                  <input
                    id={i === 0 ? id : undefined}
                    type="radio"
                    value={o.value}
                    defaultChecked={initial(f.name) === o.value}
                    className="chip__input peer"
                    {...register(f.name)}
                  />
                  <span className="chip__body">
                    <Check aria-hidden className="chip__check" />
                    {o.label}
                  </span>
                </label>
              ))}
            </div>
            {e && (
              <p id={`${id}-error`} className="mt-1.5 text-body-sm font-medium text-danger">
                {e}
              </p>
            )}
          </fieldset>
        );
      case "checkbox":
        return (
          <div key={f.name} className={cx("sm:col-span-2", !visible && "hidden")}>
            <label className="flex cursor-pointer items-start gap-3 text-body-sm">
              <input
                {...common}
                type="checkbox"
                className="mt-0.5 size-5 shrink-0 accent-accent"
                {...register(f.name)}
              />
              <span>
                {f.label}
                {f.required && (
                  <span aria-hidden className="ml-0.5 text-danger">
                    *
                  </span>
                )}
              </span>
            </label>
            {e && (
              <p id={`${id}-error`} className="mt-1.5 ml-8 text-body-sm font-medium text-danger">
                {e}
              </p>
            )}
          </div>
        );
      case "phone":
        return wrap(
          <div className="flex gap-2">
            <select
              aria-label={`${f.label} — country code`}
              defaultValue={initial("phoneCountry") || "RW"}
              className={cx(inputClass, "select-chevron h-12 w-28! shrink-0 appearance-none pr-2!")}
              {...register("phoneCountry")}
            >
              {callingCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.dial}
                </option>
              ))}
            </select>
            <input
              {...common}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              defaultValue={initial(f.name)}
              className={cx(inputClass, "h-12")}
              {...register(f.name)}
            />
          </div>,
        );
      case "file": {
        const reg = register(f.name);
        const list = values[f.name] as FileList | undefined;
        const chosen =
          list && typeof list === "object" && "length" in list && list.length ? list[0] : undefined;
        return wrap(
          <label
            className={cx(
              "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors",
              e ? "border-danger" : "border-strong hover:border-accent",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
            )}
          >
            {chosen ? (
              <FileText aria-hidden className="size-6 text-accent" />
            ) : (
              <Upload aria-hidden className="size-6 text-fg-muted" />
            )}
            <span className="font-medium">
              {chosen ? copy.file.selected.replace("{name}", chosen.name) : copy.file.choose}
            </span>
            <span className="text-body-sm text-fg-secondary">
              {chosen ? "" : `${copy.file.drop} · `}
              {copy.file.types}
            </span>
            <input
              {...common}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              {...reg}
              onChange={(ev) => {
                const file = ev.target.files?.[0];
                if (file && file.size > 5 * 1024 * 1024)
                  setError(f.name, { type: "client", message: "fileSize" });
                else if (file && !/\.(pdf|docx?)$/i.test(file.name))
                  setError(f.name, { type: "client", message: "fileType" });
                return reg.onChange(ev);
              }}
            />
          </label>,
        );
      }
      default:
        return wrap(
          <input
            {...common}
            type={f.type}
            defaultValue={initial(f.name)}
            autoComplete={f.autoComplete}
            inputMode={f.type === "url" ? "url" : undefined}
            className={cx(inputClass, "h-12")}
            {...register(f.name)}
          />,
        );
    }
  };

  const fieldsFor = (names: string[]) =>
    names.map((n) => fields.find((f) => f.name === n)).filter(Boolean) as EngineField[];
  const groups: EngineStep[] = steps ?? [
    { id: "all", title: "", fields: fields.map((f) => f.name) },
  ];
  const labelFor = (f: EngineField, v: unknown) => {
    if (f.type === "file") return (v as FileList | undefined)?.[0]?.name ?? "—";
    if (f.type === "checkbox") return v ? "✓" : "—";
    if (f.options) return f.options.find((o) => o.value === v)?.label ?? "—";
    return typeof v === "string" && v ? v : "—";
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      encType="multipart/form-data"
      noValidate
      onFocusCapture={() => void load()}
      onInput={() => {
        if (!edited) setEdited(true);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (stepMode && steps && step < steps.length) {
          void goNext();
          return;
        }
        handleSubmit(
          () => {
            if (!checkConditional(fields.map((f) => f.name))) {
              showSummary();
              return;
            }
            setSummaryNames(null);
            startTransition(() => formAction(new FormData(formRef.current!)));
          },
          () => showSummary(),
        )(event);
      }}
      className="space-y-8"
    >
      {draftKey && hydrated && draft && !edited && !dismissedDraft && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-subtle bg-accent-soft px-4 py-3 text-body-sm"
        >
          <span>{copy.restored}</span>
          <span className="flex gap-2">
            <button
              type="button"
              className="font-semibold text-accent underline-offset-4 hover:underline"
              onClick={() => {
                try {
                  reset({ ...getValues(), ...JSON.parse(draft) }, { keepDefaultValues: true });
                } catch {}
                setDismissedDraft(true);
              }}
            >
              {copy.restore}
            </button>
            <button
              type="button"
              className="text-fg-secondary underline-offset-4 hover:underline"
              onClick={() => {
                writeDraft("");
                setDismissedDraft(true);
              }}
            >
              {copy.discard}
            </button>
          </span>
        </div>
      )}

      {steps && (
        <ol
          className="flex items-center"
          aria-label={copy.step
            .replace("{n}", String(step + 1))
            .replace("{total}", String(totalSteps))}
        >
          {[...steps.map((s) => s.title), ...(review ? [copy.reviewShort] : [])].map((title, i) => {
            const done = stepMode ? i < step : false;
            const current = stepMode && i === step;
            return (
              <li
                key={title}
                className="flex flex-1 items-center last:flex-none"
                aria-current={current ? "step" : undefined}
              >
                <span className="flex flex-col items-center gap-1.5">
                  <span
                    className={cx(
                      "flex size-9 items-center justify-center rounded-full border-2 font-mono text-body-sm font-medium transition-colors duration-[var(--dur-base)]",
                      done
                        ? "border-spark bg-spark text-on-spark"
                        : current
                          ? "border-accent bg-accent text-on-accent"
                          : "border-strong text-fg-muted",
                    )}
                  >
                    {done ? <Check aria-hidden className="size-4" /> : i + 1}
                  </span>
                  <span
                    className={cx(
                      "hidden text-[0.75rem] font-medium sm:block",
                      current ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    {title}
                  </span>
                </span>
                {i < totalSteps - 1 && (
                  <span
                    aria-hidden
                    className={cx(
                      "mx-2 mb-5 h-0.5 flex-1 rounded-full sm:mb-6",
                      done ? "bg-spark" : "bg-[var(--border-strong)]",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}

      <ErrorSummary
        ref={summaryRef}
        title={summaryText(copy, errorList.length)}
        errors={errorList}
        formError={formError}
      />

      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {groups.map((g, i) => (
        <fieldset key={g.id} hidden={stepMode && i !== step} className="space-y-6">
          {g.title && (
            <legend className="contents">
              <h3
                ref={stepMode && i === step ? stepHeadingRef : undefined}
                tabIndex={-1}
                className="font-display text-heading-md outline-none"
              >
                {stepMode && (
                  <span className="mb-1 block font-mono text-body-sm font-normal text-fg-muted">
                    {copy.step.replace("{n}", String(i + 1)).replace("{total}", String(totalSteps))}
                    <span className="sr-only">: </span>
                  </span>
                )}
                {g.title}
              </h3>
            </legend>
          )}
          {fieldsFor(g.fields).some(
            (f) => f.showIf && "under18" in f.showIf && isVisible(f, values),
          ) && (
            <p className="rounded-md bg-[color-mix(in_oklch,var(--accent-spark)_12%,transparent)] px-4 py-3 text-body-sm">
              {copy.under18}
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">{fieldsFor(g.fields).map(renderField)}</div>
        </fieldset>
      ))}

      {onReview && steps && (
        <section aria-labelledby={`${idPrefix}-review`} className="space-y-5">
          <h3
            id={`${idPrefix}-review`}
            ref={stepHeadingRef}
            tabIndex={-1}
            className="font-display text-heading-md outline-none"
          >
            {copy.review}
          </h3>
          <p className="text-fg-secondary">{copy.reviewLead}</p>
          {steps.map((s, i) => (
            <div key={s.id} className="rounded-lg border border-subtle bg-surface p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{s.title}</h4>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className="text-body-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {copy.edit}
                  <span className="sr-only"> {s.title}</span>
                </button>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-body-sm sm:grid-cols-2">
                {fieldsFor(s.fields)
                  .filter((f) => isVisible(f, values))
                  .map((f) => (
                    <div key={f.name}>
                      <dt className="text-fg-muted">{f.label}</dt>
                      <dd className="font-medium break-words">{labelFor(f, values[f.name])}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))}
        </section>
      )}

      <div hidden={stepMode && steps ? step < totalSteps - 1 : false} className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3 text-body-sm">
          <input
            id={`${idPrefix}-consent`}
            type="checkbox"
            aria-invalid={codeFor(CONSENT) ? true : undefined}
            aria-describedby={codeFor(CONSENT) ? `${idPrefix}-consent-error` : undefined}
            className="mt-0.5 size-5 shrink-0 accent-accent"
            {...register(CONSENT)}
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
            {copy.terms && (
              <a
                href={copy.terms.href}
                target="_blank"
                className="ml-2 font-medium text-accent underline underline-offset-4"
              >
                {copy.terms.label}
              </a>
            )}
          </span>
        </label>
        {codeFor(CONSENT) && (
          <p id={`${idPrefix}-consent-error`} className="ml-8 text-body-sm font-medium text-danger">
            {errorText(copy, codeFor(CONSENT))}
          </p>
        )}
      </div>

      <Honeypot />
      <TrackingFields locale={locale} />
      <Turnstile siteKey={turnstileSiteKey} locale={locale} />

      <div className="flex flex-wrap items-center gap-3">
        {stepMode && step > 0 && (
          <Button
            key="back"
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => goTo(step - 1)}
          >
            <ArrowLeft aria-hidden />
            {copy.back}
          </Button>
        )}
        {stepMode && steps && step < totalSteps - 1 ? (
          // Separate keys: React must not reuse this node as the Send button. The step
          // advances inside the click's microtask checkpoint, and a reused node would
          // already be type="submit" when the browser runs the click's default action.
          <Button
            key="next"
            type="button"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              void goNext();
            }}
          >
            {copy.next}
            <ArrowRight aria-hidden data-arrow />
          </Button>
        ) : (
          <Button key="submit" type="submit" size="lg" disabled={pending}>
            {pending ? copy.submitting : (submitLabel ?? copy.submit)}
            {!pending && <ArrowRight aria-hidden data-arrow />}
          </Button>
        )}
        {draftKey && edited && <span className="text-body-sm text-fg-muted">{copy.saved}</span>}
        {draftKey && hydrated && draft && edited && (
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-1 text-body-sm text-fg-secondary hover:text-danger"
            onClick={() => {
              writeDraft("");
              reset();
              goTo(0);
            }}
          >
            <X aria-hidden className="size-4" />
            {copy.discard}
          </button>
        )}
      </div>
    </form>
  );
}
