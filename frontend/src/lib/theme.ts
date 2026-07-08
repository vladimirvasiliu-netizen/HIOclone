/**
 * Tema (light / dark) aplicata prin clasa `dark` pe <html>.
 * CSS-ul din index.css defineste ce se schimba cand aceasta clasa e prezenta.
 * Preferinta e salvata de pagina Setari sub cheia `settings-prefs`.
 */
const PREFS_KEY = 'settings-prefs';

/** Adauga/scoate clasa `dark` pe elementul radacina. */
export function applyDarkTheme(enabled: boolean): void {
  document.documentElement.classList.toggle('dark', enabled);
}

/** Citeste preferinta de tema salvata (implicit: light). */
export function readStoredDarkTheme(): boolean {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return Boolean(JSON.parse(raw).darkTheme);
  } catch {
    /* localStorage indisponibil sau JSON invalid */
  }
  return false;
}
