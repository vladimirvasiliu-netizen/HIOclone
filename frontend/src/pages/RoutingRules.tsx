// Pagina placeholder cu date mock - va fi dezvoltata intr-un ticket viitor.
const MOCK_RULES = [
  { criteriu: 'SLA (timp de livrare)', valoare: 'max 45 min', pondere: 'Ridicata' },
  { criteriu: 'Pret livrare', valoare: 'max 15 RON', pondere: 'Medie' },
  { criteriu: 'Distanta', valoare: 'max 8 km', pondere: 'Medie' },
  { criteriu: 'Fiabilitate flota', valoare: 'min 90%', pondere: 'Ridicata' },
];

export default function RoutingRules() {
  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-slate-500">
        Configureaza logica dupa care comenzile sunt rutate catre flote.
      </p>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {MOCK_RULES.map((rule) => (
          <div key={rule.criteriu} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{rule.criteriu}</p>
              <p className="text-xs text-slate-400">{rule.valoare}</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {rule.pondere}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
