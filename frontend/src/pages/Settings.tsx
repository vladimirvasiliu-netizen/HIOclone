import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { applyDarkTheme } from '../lib/theme';

type Tab = 'profile' | 'preferences';

const PREFS_KEY = 'settings-prefs';

interface Prefs {
  notifications: boolean;
  darkTheme: boolean;
  emailDigest: boolean;
}

const DEFAULT_PREFS: Prefs = {
  notifications: true,
  darkTheme: false,
  emailDigest: false,
};

// Citeste un obiect din localStorage, cu fallback daca lipseste / e corupt.
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {
    /* localStorage indisponibil sau JSON invalid */
  }
  return fallback;
}

// Toggle reutilizabil (acelasi stil ca la Reguli de rutare).
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Un rand de preferinta: titlu + descriere pe stanga, toggle pe dreapta.
function PreferenceRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${checked ? 'text-blue-600' : 'text-slate-400'}`}>
          {checked ? 'Activat' : 'Dezactivat'}
        </span>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

// Initialele pentru avatar (ex. "Vladimir Vasiliu" -> "VV").
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');

  // Pornim de la utilizatorul din context (sursa de adevar, afisat si in topbar).
  // Starea traieste in parinte, deci se pastreaza si intre cele doua tab-uri pill.
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  // Preferintele se incarca din localStorage si se salveaza automat la fiecare
  // schimbare, ca sa ramana si dupa ce parasesti pagina sau dai refresh.
  const [prefs, setPrefs] = useState<Prefs>(() => loadJSON(PREFS_KEY, DEFAULT_PREFS));

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    applyDarkTheme(prefs.darkTheme); // aplica tema imediat ce se schimba
  }, [prefs]);

  const setPref = (key: keyof Prefs, value: boolean) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const saveProfile = () => {
    // "Save": actualizam profilul in context (se reflecta imediat in topbar
    // si se persista in sesiune) si aratam confirmarea.
    updateProfile({ name, email });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profil' },
    { id: 'preferences', label: 'Preferinte' },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-sm text-slate-500">
        Gestioneaza-ti profilul si preferintele contului.
      </p>

      {/* Navigatie tip pill - fara reincarcare, doar schimba tab-ul activ */}
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Profil */}
      {tab === 'profile' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">
              {initials(name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{name || 'Fara nume'}</p>
              <p className="text-xs text-slate-400">{email || 'Fara email'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nume</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tau"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplu.ro"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={saveProfile}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Salveaza
            </button>
            <span
              className={`text-sm text-green-600 transition-opacity ${
                savedFlash ? 'opacity-100' : 'opacity-0'
              }`}
            >
              ✓ Modificari salvate
            </span>
          </div>
        </div>
      )}

      {/* Tab Preferinte */}
      {tab === 'preferences' && (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          <PreferenceRow
            title="Notificari"
            description="Primeste notificari in aplicatie pentru comenzi noi si SLA depasit."
            checked={prefs.notifications}
            onChange={(v) => setPref('notifications', v)}
          />
          <PreferenceRow
            title="Tema intunecata"
            description="Comuta interfata pe un aspect intunecat."
            checked={prefs.darkTheme}
            onChange={(v) => setPref('darkTheme', v)}
          />
          <PreferenceRow
            title="Rezumat pe email"
            description="Trimite un rezumat zilnic al comenzilor pe email."
            checked={prefs.emailDigest}
            onChange={(v) => setPref('emailDigest', v)}
          />
        </div>
      )}
    </div>
  );
}
