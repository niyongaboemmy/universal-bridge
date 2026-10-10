// Form copy is translated on the server and passed down, so no i18n runtime
// ships to the browser. Error codes look like "tooShort:20".
export type FormCopy = {
  required: string;
  optional: string;
  submit: string;
  submitting: string;
  errorSummaryOne: string;
  errorSummaryOther: string;
  genericError: string;
  rateLimited: string;
  botCheckFailed: string;
  errors: Record<string, string>;
};

export function errorText(copy: FormCopy, code: string | undefined): string | undefined {
  if (!code) return undefined;
  const [key, arg] = code.split(":");
  const template = copy.errors[key!] ?? copy.errors.required ?? code;
  return arg ? template.replace(/\{(min|max)\}/g, arg) : template;
}

export function summaryText(copy: FormCopy, count: number) {
  return (count === 1 ? copy.errorSummaryOne : copy.errorSummaryOther).replace(
    "{count}",
    String(count),
  );
}
