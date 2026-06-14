interface StoreLogoProps {
  vertical: string;
  size?: number;
  fill?: boolean;
}

function LeafIcon({ size, fill }: { size: number; fill: boolean }) {
  return fill ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2-1 6-3 10-2 4-5 8-5 8Z" />
      <path d="M10.7 10.7c2.5-2.5 4.3-4.2 6.3-5.7" />
      <path d="M5 21c.5-1.5 1-3 2.5-5" />
    </svg>
  );
}

function BoltIcon({ size, fill }: { size: number; fill: boolean }) {
  return fill ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function ForkIcon({ size, fill }: { size: number; fill: boolean }) {
  return fill ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function ShoeIcon({ size, fill }: { size: number; fill: boolean }) {
  return fill ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 4.5c-1.1 0-2 .4-2.7 1.1L5 12H2v2h2.5l1.5 3h14v-3.5c0-2.5-2-4.5-4.5-4.5h-1.1l2.1-2.1c.4-.4.5-1 .2-1.5C16.4 5 15 4.5 13.5 4.5z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12h3l5.5-6.5a2 2 0 0 1 3 0l3 3.5H20a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4l-2-2z" />
      <path d="M4 17h16" />
    </svg>
  );
}

export default function StoreLogo({ vertical, size = 22, fill = false }: StoreLogoProps) {
  switch (vertical) {
    case 'FOOD_MARKET':
      return <LeafIcon size={size} fill={fill} />;
    case 'RESTAURANT':
      return <ForkIcon size={size} fill={fill} />;
    case 'SHOE_MARKET':
      return <ShoeIcon size={size} fill={fill} />;
    default:
      return <BoltIcon size={size} fill={fill} />;
  }
}
