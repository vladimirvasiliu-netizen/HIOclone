import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { IconClock, IconCoin, IconRoute, IconShield } from '../components/layout/icons';

type Weight = 'Scazuta' | 'Medie' | 'Ridicata';

// Definitia statica a fiecarui criteriu: interval, pas, unitate, sens.
interface RuleDef {
  id: string;
  label: string;
  hint: string; // descriere scurta
  icon: ReactNode;
  accent: string; // clasa Tailwind pentru fundalul iconitei
  slider: string; // clasa accent-* pentru slider
  min: number;
  max: number;
  step: number;
  unit: string;
  direction: 'max' | 'min'; // "max 45 min" vs "min 90%"
}

// Starea reglabila a unei reguli.
interface RuleState {
  enabled: boolean;
  value: number;
  weight: Weight;
}

const RULE_DEFS: RuleDef[] = [
  {
    id: 'sla',
    label: 'SLA (timp de livrare)',
    hint: 'Timpul maxim acceptat pentru livrarea unei comenzi.',
    icon: <IconClock className="h-5 w-5" />,
    accent: 'bg-blue-100 text-blue-600',
    slider: 'accent-blue-600',
    min: 15,
    max: 90,
    step: 5,
    unit: 'min',
    direction: 'max',
  },
  {
    id: 'pret',
    label: 'Pret livrare',
    hint: 'Costul maxim de livrare suportat pentru rutare.',
    icon: <IconCoin className="h-5 w-5" />,
    accent: 'bg-amber-100 text-amber-600',
    slider: 'accent-amber-500',
    min: 5,
    max: 40,
    step: 1,
    unit: 'RON',
    direction: 'max',
  },
  {
    id: 'distanta',
    label: 'Distanta',
    hint: 'Raza maxima de livrare de la restaurant la client.',
    icon: <IconRoute className="h-5 w-5" />,
    accent: 'bg-violet-100 text-violet-600',
    slider: 'accent-violet-600',
    min: 1,
    max: 20,
    step: 1,
    unit: 'km',
    direction: 'max',
  },
  {
    id: 'fiabilitate',
    label: 'Fiabilitate flota',
    hint: 'Fiabilitatea minima a flotei catre care se ruteaza.',
    icon: <IconShield className="h-5 w-5" />,
    accent: 'bg-green-100 text-green-600',
    slider: 'accent-green-600',
    min: 50,
    max: 100,
    step: 1,
    unit: '%',
    direction: 'min',
  },
];

const WEIGHTS: Weight[] = ['Scazuta', 'Medie', 'Ridicata'];

const DEFAULT_STATE: Record<string, RuleState> = {
  sla: { enabled: true, value: 45, weight: 'Ridicata' },
  pret: { enabled: true, value: 15, weight: 'Medie' },
  distanta: { enabled: true, value: 8, weight: 'Medie' },
  fiabilitate: { enabled: true, value: 90, weight: 'Ridicata' },
};

const STORAGE_KEY = 'routing-rules';

function loadState(): Record<string, RuleState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    /* localStorage indisponibil sau JSON invalid - folosim implicit */
  }
  return DEFAULT_STATE;
}

// Culoarea badge-ului de pondere.
const WEIGHT_BADGE: Record<Weight, string> = {
  Scazuta: 'bg-slate-100 text-slate-500',
  Medie: 'bg-blue-100 text-blue-600',
  Ridicata: 'bg-emerald-100 text-emerald-700',
};

export default function RoutingRules() {
  const [state, setState] = useState<Record<string, RuleState>>(loadState);
  const [savedFlash, setSavedFlash] = useState(false);

  // Auto-save la fiecare schimbare + indicator scurt "Salvat".
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [state]);

  const update = (id: string, patch: Partial<RuleState>) =>
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const reset = () => setState(DEFAULT_STATE);

  const activeCount = useMemo(
    () => Object.values(state).filter((r) => r.enabled).length,
    [state],
  );

  return (
    <div className="max-w-3xl space-y-5">
      {/* Antet cu rezumat */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            Configureaza logica dupa care comenzile sunt rutate catre flote.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {activeCount} din {RULE_DEFS.length} reguli active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs text-green-600 transition-opacity ${
              savedFlash ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ✓ Salvat
          </span>
          <button
            onClick={reset}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Reseteaza
          </button>
        </div>
      </div>

      {/* Cardurile de reguli */}
      <div className="space-y-4">
        {RULE_DEFS.map((def) => {
          const rule = state[def.id];
          const active = rule.enabled;
          return (
            <div
              key={def.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                active ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              {/* Rand de sus: iconita + titlu + toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${def.accent}`}
                  >
                    {def.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{def.label}</p>
                    <p className="text-xs text-slate-400">{def.hint}</p>
                  </div>
                </div>

                {/* Toggle activ/inactiv */}
                <button
                  role="switch"
                  aria-checked={active}
                  onClick={() => update(def.id, { enabled: !active })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    active ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${
                      active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Controale: slider valoare + pondere */}
              <div className={`mt-4 ${active ? '' : 'pointer-events-none'}`}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {def.direction === 'max' ? 'Maxim' : 'Minim'}
                  </span>
                  <span className="tabular-nums font-semibold text-slate-800">
                    {rule.value} {def.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={rule.value}
                  onChange={(e) => update(def.id, { value: Number(e.target.value) })}
                  className={`w-full ${def.slider}`}
                />
                <div className="mt-0.5 flex justify-between text-[11px] text-slate-400">
                  <span>
                    {def.min} {def.unit}
                  </span>
                  <span>
                    {def.max} {def.unit}
                  </span>
                </div>

                {/* Selector de pondere (segmented) */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Pondere in decizie</span>
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
                    {WEIGHTS.map((w) => (
                      <button
                        key={w}
                        onClick={() => update(def.id, { weight: w })}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          rule.weight === w
                            ? WEIGHT_BADGE[w]
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
