import { useEffect, useState } from 'react';
import { getSimulatorStatus, setSimulatorMix } from '../api/simulatorApi';

/**
 * Doua slidere legate (Glovo + Bolt Food) care controleaza proportia in care
 * simulatorul genereaza comenzi. Suma e mereu 100%: cand cresti unul, celalalt
 * scade automat. Valoarea se trimite la backend cand eliberezi sliderul.
 */
export function ProviderMixControl() {
  const [glovo, setGlovo] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const bolt = 100 - glovo;

  // La incarcare, citim distributia curenta din backend.
  useEffect(() => {
    getSimulatorStatus()
      .then((s) => setGlovo(s.mix.glovo))
      .catch(() => {
        /* backend indisponibil - ramanem pe valoarea implicita */
      });
  }, []);

  const commit = async (glovoValue: number) => {
    setIsSaving(true);
    try {
      const s = await setSimulatorMix(glovoValue);
      setGlovo(s.mix.glovo); // sincronizam cu ce a confirmat backend-ul
    } catch {
      /* eroare tranzitorie - ignoram */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Distributie comenzi simulate</h2>
        {isSaving && <span className="text-xs text-slate-400">Se salveaza...</span>}
      </div>
      <p className="mb-4 mt-1 text-xs text-slate-500">
        Proportia in care vin comenzile pe fiecare platforma. Suma e mereu 100%.
      </p>

      {/* Glovo */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-glovo-dark">Glovo</span>
          <span className="tabular-nums text-slate-600">{glovo}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={glovo}
          onChange={(e) => setGlovo(Number(e.target.value))}
          onMouseUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commit(Number((e.target as HTMLInputElement).value))}
          className="w-full accent-glovo"
        />
      </div>

      {/* Bolt Food */}
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-bolt-dark">Bolt Food</span>
          <span className="tabular-nums text-slate-600">{bolt}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={bolt}
          onChange={(e) => setGlovo(100 - Number(e.target.value))}
          onMouseUp={(e) => commit(100 - Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commit(100 - Number((e.target as HTMLInputElement).value))}
          className="w-full accent-bolt"
        />
      </div>

      {/* Bara vizuala combinata */}
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-glovo" style={{ width: `${glovo}%` }} />
        <div className="bg-bolt" style={{ width: `${bolt}%` }} />
      </div>
    </div>
  );
}
