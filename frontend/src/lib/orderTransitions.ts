import type { OrderStatus } from '../types/order';

/** Eticheta afisata pentru fiecare status. */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Noua',
  ACCEPTED: 'Acceptata',
  IN_PREPARATION: 'In preparare',
  READY_FOR_PICKUP: 'Gata de ridicare',
  PICKED_UP: 'Ridicata de curier',
  DELIVERED: 'Livrata',
  CANCELLED: 'Anulata',
  REJECTED: 'Respinsa',
};

/**
 * Fluxul normal al unei comenzi acceptate: fiecare status stie care e
 * urmatorul pas. Nu se poate sari peste etape.
 */
const NEXT_IN_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  ACCEPTED: 'IN_PREPARATION',
  IN_PREPARATION: 'READY_FOR_PICKUP',
  READY_FOR_PICKUP: 'PICKED_UP',
  PICKED_UP: 'DELIVERED',
};

/** Statusuri "in progres": acceptate, dar inca nefinalizate - au nevoie de update ulterior. */
const IN_PROGRESS_STATUSES: OrderStatus[] = [
  'ACCEPTED',
  'IN_PREPARATION',
  'READY_FOR_PICKUP',
  'PICKED_UP',
];

/** True daca o comanda a fost acceptata si asteapta pasul urmator de status. */
export function isInProgress(status: OrderStatus): boolean {
  return IN_PROGRESS_STATUSES.includes(status);
}

export interface StatusAction {
  status: OrderStatus;
  label: string;
  variant: 'primary' | 'danger';
}

/**
 * Actiunile permise dintr-un status dat (butoanele afisate):
 *  - NEW: doar Accepta sau Respinge
 *  - in flux (dupa acceptare): doar pasul urmator + Anuleaza
 *  - stari finale (Livrata / Anulata / Respinsa): nicio actiune
 */
export function allowedActions(current: OrderStatus): StatusAction[] {
  if (current === 'NEW') {
    return [
      { status: 'ACCEPTED', label: 'Accepta', variant: 'primary' },
      { status: 'REJECTED', label: 'Respinge', variant: 'danger' },
    ];
  }

  const next = NEXT_IN_FLOW[current];
  if (!next) return []; // stare finala

  return [
    { status: next, label: STATUS_LABELS[next], variant: 'primary' },
    { status: 'CANCELLED', label: 'Anuleaza', variant: 'danger' },
  ];
}
