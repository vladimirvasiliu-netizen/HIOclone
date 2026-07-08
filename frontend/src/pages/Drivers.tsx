import { useMemo, useState } from 'react';

type DriverStatus = 'online' | 'busy' | 'offline';

interface Driver {
  id: number;
  name: string;
  vehicle: string;
  status: DriverStatus;
  deliveriesToday: number;
}

// 12 curieri mock (fara backend).
const INITIAL_DRIVERS: Driver[] = [
  { id: 1, name: 'Andrei Popescu', vehicle: 'Scuter', status: 'online', deliveriesToday: 12 },
  { id: 2, name: 'Maria Ionescu', vehicle: 'Bicicleta', status: 'busy', deliveriesToday: 8 },
  { id: 3, name: 'Cristian Dumitru', vehicle: 'Masina', status: 'offline', deliveriesToday: 0 },
  { id: 4, name: 'Elena Radu', vehicle: 'Scuter', status: 'online', deliveriesToday: 15 },
  { id: 5, name: 'Alexandru Stan', vehicle: 'Bicicleta', status: 'online', deliveriesToday: 6 },
  { id: 6, name: 'Ioana Munteanu', vehicle: 'Pe jos', status: 'busy', deliveriesToday: 4 },
  { id: 7, name: 'Bogdan Constantin', vehicle: 'Masina', status: 'offline', deliveriesToday: 2 },
  { id: 8, name: 'Ana Marinescu', vehicle: 'Scuter', status: 'online', deliveriesToday: 11 },
  { id: 9, name: 'Florin Gheorghe', vehicle: 'Bicicleta', status: 'busy', deliveriesToday: 9 },
  { id: 10, name: 'Diana Petrescu', vehicle: 'Masina', status: 'online', deliveriesToday: 7 },
  { id: 11, name: 'Radu Voicu', vehicle: 'Scuter', status: 'offline', deliveriesToday: 1 },
  { id: 12, name: 'Gabriela Sandu', vehicle: 'Bicicleta', status: 'online', deliveriesToday: 13 },
];

const STATUS_META: Record<DriverStatus, { label: string; badge: string }> = {
  online: { label: 'Online', badge: 'bg-green-100 text-green-700' },
  busy: { label: 'Ocupat', badge: 'bg-amber-100 text-amber-700' },
  offline: { label: 'Offline', badge: 'bg-slate-200 text-slate-600' },
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  // Lista de vehicule pentru dropdown - derivata din date, fara dubluri.
  const vehicles = useMemo(
    () => Array.from(new Set(INITIAL_DRIVERS.map((d) => d.vehicle))),
    [],
  );

  // Comuta online <-> offline (un curier "ocupat" trece pe offline).
  const toggleStatus = (id: number) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: d.status === 'offline' ? 'online' : 'offline' } : d,
      ),
    );
  };

  // Sumar pe status - se recalculeaza automat la fiecare comutare.
  const counts = useMemo(
    () => ({
      online: drivers.filter((d) => d.status === 'online').length,
      busy: drivers.filter((d) => d.status === 'busy').length,
      offline: drivers.filter((d) => d.status === 'offline').length,
    }),
    [drivers],
  );

  const query = search.trim().toLowerCase();
  const visibleDrivers = drivers.filter(
    (d) =>
      (query === '' || d.name.toLowerCase().includes(query)) &&
      (statusFilter === '' || d.status === statusFilter) &&
      (vehicleFilter === '' || d.vehicle === vehicleFilter),
  );

  return (
    <div className="space-y-4">
      {/* Sumar pe status - fiecare cartonas e un buton de filtrare.
          Click pe cel activ il deselecteaza (afiseaza toti curierii). */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(STATUS_META) as DriverStatus[]).map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(active ? '' : s)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                active
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_META[s].badge}`}>
                {STATUS_META[s].label}
              </span>
              <span className="font-semibold text-slate-800">{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Cautare dupa nume */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cauta dupa nume..."
          className="w-56 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">Toate vehiculele</option>
          {vehicles.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="text-sm text-blue-600 hover:underline"
          >
            Sterge filtrul ({STATUS_META[statusFilter].label})
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2 font-medium">Nume</th>
              <th className="px-4 py-2 font-medium">Vehicul</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Livrari azi</th>
              <th className="px-4 py-2 text-right font-medium">Actiune</th>
            </tr>
          </thead>
          <tbody>
            {visibleDrivers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Niciun curier pentru criteriile selectate.
                </td>
              </tr>
            ) : (
              visibleDrivers.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800">{d.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{d.vehicle}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_META[d.status].badge}`}
                    >
                      {STATUS_META[d.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{d.deliveriesToday}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => toggleStatus(d.id)}
                      className={`rounded-md px-3 py-1 text-xs font-medium text-white ${
                        d.status === 'offline'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {d.status === 'offline' ? 'Seteaza online' : 'Seteaza offline'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
