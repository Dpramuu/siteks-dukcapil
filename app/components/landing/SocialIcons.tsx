type IconProps = { className?: string };

export function InstagramGlyph({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function TiktokGlyph({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.6 3c.35 2.1 1.85 3.75 3.9 4.05v3.05a7.1 7.1 0 0 1-3.9-1.15v6.6a5.75 5.75 0 1 1-5.75-5.75c.3 0 .6.02.9.07v3.1a2.7 2.7 0 1 0 1.9 2.58V3h2.95Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FacebookGlyph({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13.6 21v-7.6h2.55l.4-3h-2.95V8.5c0-.87.24-1.46 1.5-1.46h1.6V4.33C16.4 4.23 15.4 4.14 14.24 4.14c-2.36 0-3.98 1.44-3.98 4.1v2.28H7.85v3h2.41V21h3.34Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsappGlyph({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.55 13.3L3.2 20.8l4.45-1.2A8.8 8.8 0 1 0 12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 8.4c.28-.62.55-.63.8-.64.2 0 .45 0 .65.5.28.58.85 1.85.9 2 .1.15.15.35.03.56-.1.2-.16.32-.32.5-.16.18-.34.4-.16.7.18.4.92 1.4 1.97 2.25 1.3 1.1 2 1.1 2.28.98.28-.1.46-.4.64-.6.17-.2.36-.28.58-.16.2.1 1.3.63 1.55.75.24.12.4.18.46.28.06.16.06 1-.36 1.42-.44.45-1.4.83-2.35.65-1.1-.2-2.7-.95-4.1-2.25-1.6-1.4-2.5-3-2.7-3.6-.2-.55-.56-1.32-.1-2.34Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function XGlyph({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4.5 4.5l15 15M19.5 4.5l-15 15"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}