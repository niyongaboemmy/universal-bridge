/**
 * Stat counter (UI/UX §11): lib/fx/countup counts up once when half visible.
 * The final number is server-rendered, so reduced motion, no-JS and crawlers
 * see the real value.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  locale,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  locale: string;
}) {
  const formatted = `${prefix}${new Intl.NumberFormat(locale === "rw" ? "en" : locale).format(value)}${suffix}`;
  return (
    <span
      data-fx="countup"
      data-value={value}
      data-prefix={prefix}
      data-suffix={suffix}
      data-locale={locale}
      className="tabular"
    >
      {formatted}
    </span>
  );
}
