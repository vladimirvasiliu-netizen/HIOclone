// Pagina placeholder cu date mock - va fi dezvoltata intr-un ticket viitor.
const MOCK_FLEETS = [
  { name: 'Bolt Food', status: 'Online', reliability: 98 },
  { name: 'Glovo', status: 'Online', reliability: 95 },
];

export default function Fleets() {
  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Flotele de livrare disponibile si fiabilitatea lor in timp real.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
  );
}
