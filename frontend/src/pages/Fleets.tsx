import { ProviderMixControl } from '../components/ProviderMixControl';

// Pagina cu date mock - va fi dezvoltata intr-un ticket viitor.
interface Fleet {
  name: string;
  status: string;
  reliability: number;
  drivers: number; // numar livratori activi
  etaMinutes: number; // timp estimativ de livrare (minute)
  avgCost: number; // cost mediu de livrare (lei)
}

const MOCK_FLEETS: Fleet[] = [
  { name: 'Bolt Food', status: 'Online', reliability: 98, drivers: 24, etaMinutes: 28, avgCost: 9.5 },
  { name: 'Glovo', status: 'Online', reliability: 95, drivers: 18, etaMinutes: 32, avgCost: 10.2 },
];

// KPI-uri agregate pe toate flotele.
const totalDrivers = MOCK_FLEETS.reduce((sum, f) => sum + f.drivers, 0);
const avgEta = Math.round(
  MOCK_FLEETS.reduce((sum, f) => sum + f.etaMinutes, 0) / MOCK_FLEETS.length,
);
const avgCost =
  MOCK_FLEETS.reduce((sum, f) => sum + f.avgCost, 0) / MOCK_FLEETS.length;

const SUMMARY_KPIS = [
  { label: 'Livratori activi', value: `${totalDrivers}` },
  { label: 'Timp estimativ livrare', value: `${avgEta} min` },
  { label: 'Cost mediu livrare', value: `${avgCost.toFixed(2)} lei` },
];

export default function Fleets() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Flotele de livrare disponibile, fiabilitatea lor in timp real si distributia
        comenzilor generate intre platforme.
      </p>

      {/* KPI-uri agregate */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUMMARY_KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Flote (stanga) + distributie comenzi (dreapta) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cardurile de flote */}
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800">Flote de livrare</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MOCK_FLEETS.map((fleet) => (
              <div
                key={fleet.name}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{fleet.name}</span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      fleet.status === 'Online'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {fleet.status}
                  </span>
                </div>

                {/* Statistici flota */}
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 py-2">
                    <dt className="text-xs text-slate-500">Livratori</dt>
                    <dd className="text-sm font-semibold text-slate-800">{fleet.drivers}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <dt className="text-xs text-slate-500">ETA</dt>
                    <dd className="text-sm font-semibold text-slate-800">{fleet.etaMinutes} min</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <dt className="text-xs text-slate-500">Cost mediu</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {fleet.avgCost.toFixed(2)} lei
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-sm text-slate-500">Fiabilitate</p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${fleet.reliability}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">{fleet.reliability}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Distributie comenzi simulate (mutat aici din pagina Comenzi) */}
        <div>
          <ProviderMixControl />
        </div>
      </div>
    </div>
  );
}
