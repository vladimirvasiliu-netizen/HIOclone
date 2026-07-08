import type { ReactNode } from 'react';
import { IconHome, IconOrders, IconFleets, IconCouriers, IconRules, IconSettings } from './icons';

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Sursa unica de adevar pentru meniul lateral. Sidebar-ul deseneaza aceste
 * grupuri, iar Topbar-ul deriva titlul paginii din acelasi loc (getPageTitle).
 * Cand adaugi o pagina noua, o adaugi AICI si apare automat in meniu.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Operatiuni',
    items: [
      { label: 'Prezentare generala', path: '/dashboard', icon: <IconHome /> },
      { label: 'Comenzi', path: '/orders', icon: <IconOrders /> },
      { label: 'Curieri', path: '/drivers', icon: <IconCouriers /> },
      { label: 'Flote', path: '/fleets', icon: <IconFleets /> },
    ],
  },
  {
    title: 'Configurare',
    items: [
      { label: 'Reguli de rutare', path: '/rules', icon: <IconRules /> },
      { label: 'Setari', path: '/settings', icon: <IconSettings /> },
    ],
  },
];

/** Deriva titlul paginii din URL, pentru topbar. */
export function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/orders/')) {
    return 'Detaliu comanda';
  }
  const all = NAV_GROUPS.flatMap((group) => group.items);
  return all.find((item) => item.path === pathname)?.label ?? 'ZangConnect';
}
