/**
 * Extract plural branches from an ICU message like
 * "Fix {count, plural, one {# problem} other {# problems}}:" so a client can
 * pluralise without shipping an ICU runtime. "#" becomes "{count}".
 */
export function icuPluralForms(message: string): { zero?: string; one: string; other: string } {
  const start = message.indexOf("plural,");
  if (start === -1) return { one: message, other: message };
  const open = message.lastIndexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < message.length; end++) {
    if (message[end] === "{") depth++;
    else if (message[end] === "}" && --depth === 0) break;
  }
  const before = message.slice(0, open);
  const after = message.slice(end + 1);
  const body = message.slice(start + "plural,".length, end);
  const forms: Record<string, string> = {};
  for (const m of body.matchAll(/(=0|zero|one|other|few|many|two)\s*\{([^{}]*)\}/g)) {
    forms[m[1]!] = `${before}${m[2]!.replace(/#/g, "{count}")}${after}`;
  }
  return {
    zero: forms["=0"] ?? forms.zero,
    one: forms.one ?? forms.other ?? message,
    other: forms.other ?? message,
  };
}
