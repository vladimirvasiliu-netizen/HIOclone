import { useMemo, useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { createDriver, deleteDriver, updateDriver, type DriverStatus } from '../api/driversApi';

const STATUS_META: Record<DriverStatus, { label: string; badge: string }> = {
  online: { label: 'Online', badge: 'bg-green-100 text-green-700' },
  busy: { label: 'Ocupat', badge: 'bg-amber-100 text-amber-700' },
  offline: { label: 'Offline', badge: 'bg-slate-200 text-slate-600' },
};

const VEHICLE_OPTIONS = ['Scuter', 'Bicicleta', 'Masina', 'Pe jos'];

export default function Drivers() {
  const { drivers, isLoading, error, refetch } = useDrivers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  // Formular de adaugare (POST).
  const [newName, setNewName] = useState('');
  const [newVehicle, setNewVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [newStatus, setNewStatus] = useState<DriverStatus>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Optiunile de vehicul pentru filtru - derivate din datele primite.
  const vehicles = useMemo(
    () => Array.from(new Set(drivers.map((d) => d.vehicle))),
    [drivers],
  );

  // Sumar pe status.
  const counts = useMemo(
    () => ({
      online: drivers.filter((d) => d.status === 'online').length,
      busy: drivers.filter((d) => d.status === 'busy').length,
      offline: drivers.filter((d) => d.status === 'offline').length,
    }),
    [drivers],
  );

  const addDriver = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await createDriver({ name: newName.trim(), vehicle: newVehicle, status: newStatus });
      setNewName('');
      await refetch(); // lista reflecta ce a salvat serverul
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Eroare la adaugare');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeStatus = async (id: number, status: DriverStatus) => {
    setActionError(null);
    try {
      await updateDriver(id, { status });
      await refetch(); // lista reflecta ce a salvat serverul
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Eroare la modificare');
    }
  };

  const removeDriver = async (id: number) => {
    setActionError(null);
    try {
      await deleteDriver(id);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Eroare la stergere');
    }
  };

  const query = search.trim().toLowerCase();
  const visibleDrivers = drivers.filter(
    (d) =>
      (query === '' || d.name.toLowerCase().includes(query)) &&
      (statusFilter === '' || d.status === statusFilter) &&
      (vehicleFilter === '' || d.vehicle === vehicleFilter),
  );

  return (
    <div className="space-y-4">
      {/* Sumar pe status - fiecare cartonas e un buton de filtrare. */}
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

      {/* Cautare + filtru vehicul */}
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

      {/* Formular adaugare curier (POST) */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Nume</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nume curier"
            className="w-48 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Vehicul</label>
          <select
            value={newVehicle}
            onChange={(e) => setNewVehicle(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as DriverStatus)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {(Object.keys(STATUS_META) as DriverStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={addDriver}
          disabled={isSubmitting || !newName.trim()}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Se adauga...' : 'Adauga curier'}
        </button>
      </div>

      {/* Eroare la actiuni (create/delete) */}
      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Continut: loading / eroare / tabel */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-slate-400">
          Se incarca curierii...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          <p className="font-medium">Nu am putut incarca curierii.</p>
          <p className="mt-1 text-red-600">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
          >
            Reincearca
          </button>
        </div>
      ) : (
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
                      {/* Schimbi statusul dintr-un click -> PATCH pe server */}
                      <select
                        value={d.status}
                        onChange={(e) => changeStatus(d.id, e.target.value as DriverStatus)}
                        className={`cursor-pointer rounded-md border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${STATUS_META[d.status].badge}`}
                      >
                        {(Object.keys(STATUS_META) as DriverStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{d.deliveriesToday}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => removeDriver(d.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Sterge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
