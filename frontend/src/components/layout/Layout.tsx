import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const STORAGE_KEY = 'sidebar-collapsed';

// Imagine de fundal reprezentativa pentru fiecare pagina (fisiere din public/bg/).
const PAGE_BACKGROUNDS: { match: (path: string) => boolean; image: string }[] = [
  { match: (p) => p.startsWith('/orders'), image: '/bg/orders.svg' }, // acopera si /orders/:id
  { match: (p) => p.startsWith('/dashboard'), image: '/bg/overview.svg' },
  { match: (p) => p.startsWith('/drivers'), image: '/bg/drivers.svg' },
  { match: (p) => p.startsWith('/fleets'), image: '/bg/fleets.svg' },
  { match: (p) => p.startsWith('/rules'), image: '/bg/rules.svg' },
];

function backgroundFor(pathname: string): string | null {
  return PAGE_BACKGROUNDS.find((b) => b.match(pathname))?.image ?? null;
}

/**
 * Shell-ul aplicatiei: sidebar + topbar in jurul continutului.
 * <Outlet /> este locul unde React Router injecteaza pagina rutei curente.
 * Astfel sidebar-ul si topbar-ul raman fixe, iar la navigare se schimba
 * doar zona din mijloc.
 */
export function Layout() {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );
  const { pathname } = useLocation();
  const background = backgroundFor(pathname);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next)); // tine minte preferinta
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="relative flex-1 overflow-y-auto px-6 py-6">
          {/* Fundal reprezentativ pe pagina: fixat in spate, foarte estompat,
              cu pointer-events-none ca sa nu interfereze cu clickurile. */}
          {background && (
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 bg-center bg-no-repeat opacity-[0.24]"
              style={{
                backgroundImage: `url("${background}")`,
                backgroundSize: 'min(70vmin, 640px)',
              }}
            />
          )}
          {/* Continutul paginii, deasupra fundalului */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
