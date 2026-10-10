/**
 * Static, self-hosted map illustration (FR-CON-01: no third-party map widget,
 * see gap G-3). Stylised streets around the office; links to Google Maps.
 */
export function OfficeMap({ label }: { label: string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 400 220" className="h-full w-full">
      <rect width="400" height="220" fill="var(--bg-sunken)" />
      <g stroke="var(--border-strong)" strokeWidth="10" strokeLinecap="round" fill="none">
        <path d="M-10 150 C 80 140, 160 120, 230 90 S 360 40, 420 30" />
        <path d="M60 -10 L 140 240" />
        <path d="M260 -10 C 250 60, 270 140, 330 240" />
      </g>
      <g stroke="var(--border-subtle)" strokeWidth="4" fill="none">
        <path d="M0 60 H 400" />
        <path d="M0 200 C 120 190, 260 200, 400 180" />
        <path d="M200 0 V 220" />
      </g>
      <text x="300" y="52" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
        KN 89 St
      </text>
      <text x="20" y="138" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
        Nyabugogo–Muhima Rd
      </text>
      <g transform="translate(222 92)">
        <circle r="22" fill="var(--accent-primary)" opacity="0.15" className="map-pulse" />
        <circle r="9" fill="var(--accent-primary)" stroke="var(--bg-surface)" strokeWidth="3" />
        <circle r="3" fill="var(--accent-spark)" />
      </g>
    </svg>
  );
}
