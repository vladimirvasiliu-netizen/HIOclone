import type { OrderPlatform, OrderStatus } from '../types/order';

interface FilterBarProps {
  platform?: OrderPlatform;
  status?: OrderStatus;
  onPlatformChange: (platform?: OrderPlatform) => void;
  onStatusChange: (status?: OrderStatus) => void;
}

const PLATFORM_OPTIONS: { value?: OrderPlatform; label: string }[] = [
  { value: undefined, label: 'Toate platformele' },
  { value: 'BOLT_FOOD', label: 'Bolt Food' },
  { value: 'GLOVO', label: 'Glovo' },
];

const STATUS_OPTIONS: { value?: OrderStatus; label: string }[] = [
  { value: undefined, label: 'Toate statusurile' },
  { value: 'NEW', label: 'Noua' },
  { value: 'ACCEPTED', label: 'Acceptata' },
  { value: 'IN_PREPARATION', label: 'In preparare' },
  { value: 'READY_FOR_PICKUP', label: 'Gata de ridicare' },
  { value: 'PICKED_UP', label: 'Ridicata de curier' },
  { value: 'DELIVERED', label: 'Livrata' },
  { value: 'CANCELLED', label: 'Anulata' },
  { value: 'REJECTED', label: 'Respinsa' },
];

export function FilterBar({
  platform,
  status,
  onPlatformChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        value={platform ?? ''}
        onChange={(e) => onPlatformChange((e.target.value || undefined) as OrderPlatform | undefined)}
      >
        {PLATFORM_OPTIONS.map((option) => (
          <option key={option.label} value={option.value ?? ''}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        value={status ?? ''}
        onChange={(e) => onStatusChange((e.target.value || undefined) as OrderStatus | undefined)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.label} value={option.value ?? ''}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
