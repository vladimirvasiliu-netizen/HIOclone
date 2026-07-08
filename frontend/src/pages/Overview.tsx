import { useMemo, useState, type ReactNode } from 'react';
import { useOrders } from '../hooks/useOrders';
import type { OrderPlatform, OrderStatus } from '../types/order';
import { PlatformBadge } from '../components/PlatformBadge';
import { StatusBadge } from '../components/StatusBadge';
import { IconOrders, IconCheck, IconFleets, IconClock } from '../components/layout/icons';

// Statusuri "finale" - o comanda in aceste stari nu mai e activa.
const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'REJECTED'];

// Partea retinuta de fiecare platforma DIN COSTUL DE LIVRARE (mai mare decat a noastra).
// Platforma noastra e remunerata din restul livrarii, nu din totalul comenzii.
const COMMISSION_RATE: Record<OrderPlatform, number> = {
  GLOVO: 0.7,
  BOLT_FOOD: 0.68,
};

/** Formateaza o suma in RON, cu 2 zecimale. */
function money(value: number): string {
  return `${value.toFixed(2)} RON`;
}

/** Verifica daca o data (ISO string) e din ziua curenta. */
function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Timp relativ prietenos: "acum 5 min", "acum 2 h", etc. */
function timeAgo(dateStr: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 1) return 'chiar acum';
  if (diffMin < 60) return `acum ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `acum ${diffH} h`;
  return `acum ${Math.floor(diffH / 24)} zile`;
}

interface Kpi {
  label: string;
  value: string;
  icon: ReactNode;
}

export default function Overview() {
  // useOrders face polling la 5s -> KPI-urile se actualizeaza in timp real.
  const { orders, isLoading } = useOrders({});

  const kpis: Kpi[] = useMemo(() => {
    const active = orders.filter((o) => !TERMINAL_STATUSES.includes(o.status)).length;
    const deliveredToday = orders.filter(
      (o) => o.status === 'DELIVERED' && isToday(o.updatedAt),
    ).length;
    const inDelivery = orders.filter((o) => o.status === 'PICKED_UP').length;

    const delivered = orders.filter((o) => o.status === 'DELIVERED');
    const avgMin = delivered.length
      ? Math.round(
          delivered.reduce(
            (sum, o) =>
              sum +
              (new Date(o.updatedAt).getTime() - new Date(o.placedAt).getTime()) / 60000,
            0,
          ) / delivered.length,
        )
      : null;

    return [
      { label: 'Comenzi active', value: String(active), icon: <IconOrders className="h-5 w-5" /> },
      { label: 'Livrate azi', value: String(deliveredToday), icon: <IconCheck className="h-5 w-5" /> },
      { label: 'In livrare', value: String(inDelivery), icon: <IconFleets className="h-5 w-5" /> },
      {
        label: 'Timp mediu livrare',
        value: avgMin === null ? '—' : `${avgMin} min`,
        icon: <IconClock className="h-5 w-5" />,
      },
    ];
  }, [orders]);

  const [showBreakdown, setShowBreakdown] = useState(false);

  // Venitul nostru vine DOAR din livrare: din fiecare cost de livrare,
  // platformele (Glovo/Bolt) retin partea lor; restul e venitul nostru.
  const revenue = useMemo(() => {
    const valid = orders.filter(
      (o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED',
    );
    let deliveryTotal = 0;
    let commission = 0;
    const rows = valid.map((o) => {
      const fee = Number(o.deliveryFee ?? 0);
      const platformCut = fee * COMMISSION_RATE[o.platform];
      const ourCut = fee - platformCut;
      deliveryTotal += fee;
      commission += platformCut;
      return {
        id: o.id,
        externalOrderId: o.externalOrderId,
        platform: o.platform,
        fee,
        platformCut,
        ourCut,
      };
    });
    return { deliveryTotal, commission, net: deliveryTotal - commission, rows };
  }, [orders]);

  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPI-uri: 1 coloana pe mobil, 2 pe tableta, 4 pe desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{kpi.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {kpi.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Venituri din intermediere (doar din livrare) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Venituri din intermediere</h2>
          <button
            onClick={() => setShowBreakdown((v) => !v)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {showBreakdown ? 'Ascunde detalii' : 'Vezi pe comenzi'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Total livrari incasate</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {money(revenue.deliveryTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Partea Glovo / Bolt Food</p>
            <p className="mt-1 text-xl font-semibold text-red-600">−{money(revenue.commission)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Venit net (platforma noastra)</p>
            <p className="mt-1 text-xl font-semibold text-green-600">{money(revenue.net)}</p>
          </div>
        </div>
        {showBreakdown && (
          <div className="mt-4 overflow-x-auto border-t border-slate-100 pt-3">
            {revenue.rows.length === 0 ? (
              <p className="py-2 text-sm text-slate-400">Nicio comanda valida inca.</p>
            ) : (
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-1 pr-4 font-medium">Comanda</th>
                    <th className="py-1 pr-4 font-medium">Platforma</th>
                    <th className="py-1 pr-4 text-right font-medium">Livrare</th>
                    <th className="py-1 pr-4 text-right font-medium">Glovo/Bolt</th>
                    <th className="py-1 text-right font-medium">ZangConnect</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.rows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-50">
                      <td className="py-1.5 pr-4 text-slate-600">#{r.externalOrderId}</td>
                      <td className="py-1.5 pr-4">
                        <PlatformBadge platform={r.platform} />
                      </td>
                      <td className="py-1.5 pr-4 text-right text-slate-600">{money(r.fee)}</td>
                      <td className="py-1.5 pr-4 text-right text-red-600">{money(r.platformCut)}</td>
                      <td className="py-1.5 text-right font-medium text-green-600">
                        {money(r.ourCut)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Suntem remunerati doar dintr-un procent din livrare. Partea platformelor: Glovo 70%,
          Bolt Food 68% din livrare (restul e venitul nostru). Se exclud comenzile anulate/respinse.
        </p>
      </div>

      {/* Feed de activitate recenta - ultimele comenzi reale */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Activitate recenta</h2>

        {isLoading && orders.length === 0 ? (
          <p className="py-4 text-sm text-slate-400">Se incarca...</p>
        ) : recent.length === 0 ? (
          <p className="py-4 text-sm text-slate-400">
            Nicio comanda inca. Porneste simulatorul din pagina Comenzi.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <PlatformBadge platform={o.platform} />
                  <span className="truncate text-sm text-slate-700">
                    Comanda #{o.externalOrderId}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(o.updatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
