import type { OrderPlatform } from '../types/order';

const PLATFORM_LABELS: Record<OrderPlatform, string> = {
  BOLT_FOOD: 'Bolt Food',
  GLOVO: 'Glovo',
};

const PLATFORM_STYLES: Record<OrderPlatform, string> = {
  BOLT_FOOD: 'bg-bolt/10 text-bolt-dark border-bolt/30',
  GLOVO: 'bg-glovo/20 text-glovo-dark border-glovo/40',
};

export function PlatformBadge({ platform }: { platform: OrderPlatform }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PLATFORM_STYLES[platform]}`}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
