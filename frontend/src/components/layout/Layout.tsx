import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const STORAGE_KEY = 'sidebar-collapsed';

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
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
