import type { OrderStatus } from '../types/order';
import { STATUS_FLOW, STATUS_LABELS } from '../lib/orderTransitions';

/**
 * Indicator de pasi (stepper) pentru fluxul unei comenzi:
 * Noua -> Acceptata -> In preparare -> Gata de ridicare -> Ridicata -> Livrata.
 * Pasii parcursi sunt bifati, pasul curent e evidentiat, restul sunt gri.
 */
export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  // Anulata / Respinsa nu urmeaza fluxul liniar.
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        Comanda a fost {status === 'CANCELLED' ? 'anulata' : 'respinsa'} — nu mai urmeaza pasii
        normali.
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <ol className="flex min-w-max items-start">
      {STATUS_FLOW.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step} className="flex items-start">
            <div className="flex w-20 flex-col items-center gap-1 text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-blue-600 text-white'
                    : current
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`text-xs leading-tight ${
                  current
                    ? 'font-semibold text-blue-700'
                    : done
                      ? 'text-slate-600'
                      : 'text-slate-400'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <span
                className={`mt-4 h-0.5 w-6 shrink-0 ${
                  i < currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
