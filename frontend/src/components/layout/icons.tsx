/**
 * Iconite SVG minimale (stil "outline"), fara librarie externa.
 * Fiecare accepta className ca sa-i putem controla marimea/culoarea din Tailwind.
 */
interface IconProps {
  className?: string;
}

function Svg({ className = 'h-5 w-5', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconOrders({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Svg>
  );
}

export function IconFleets({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17.5" cy="17.5" r="1.6" />
    </Svg>
  );
}

export function IconRules({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h8M16 6h4M4 12h4M12 12h8M4 18h8M16 18h4" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="14" cy="18" r="2" />
    </Svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 6 2.5 6H3.5S6 15 6 9z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function IconChevronDoubleLeft({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m11 7-5 5 5 5M18 7l-5 5 5 5" />
    </Svg>
  );
}
