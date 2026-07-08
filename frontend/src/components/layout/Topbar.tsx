import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { getOrders } from '../../api/ordersApi';
import type { Order, OrderPlatform } from '../../types/order';
import { getPageTitle } from './navConfig';
import { IconBell, IconSearch } from './icons';

/**
 * Notificari mock (nu exista backend real de notificari).
 * `target` spune ce reprezinta notificarea si unde duce click-ul:
 *  - 'order' -> o comanda specifica (ID-ul e legat de o comanda reala din backend)
 *  - 'route' -> o pagina fixa
 *  - 'none'  -> pur informativa, fara actiune
 */
type NotificationTarget =
  | { type: 'order'; platform?: OrderPlatform }
  | { type: 'route'; path: string }
  | { type: 'none' };

interface Notification {
  id: number;
  title: string;
  time: string;
  target: NotificationTarget;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Comanda noua de la Glovo', time: 'acum 2 min', target: { type: 'order', platform: 'GLOVO' } },
  { id: 2, title: 'Flota Bolt Food a revenit online', time: 'acum 15 min', target: { type: 'route', path: '/fleets' } },
  { id: 3, title: 'SLA depasit pentru comanda', time: 'acum 1 ora', target: { type: 'order' } },
];

/**
 * Notificarile citite se tin minte PER UTILIZATOR (cheia include email-ul),
 * ca fiecare cont sa-si aiba propria stare, nu una comuna pe browser.
 */
const READ_STORAGE_PREFIX = 'read-notifications';

function readStorageKey(email: string | undefined): string {
  return `${READ_STORAGE_PREFIX}:${email ?? 'anon'}`;
}

function readStoredReadIds(key: string): number[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Cheie de stocare legata de utilizatorul curent (per cont, nu per browser).
  const storageKey = readStorageKey(user?.email);
  // Notificarile deja deschise - citite din localStorage, ca sa persiste intre sesiuni.
  const [readIds, setReadIds] = useState<number[]>(() => readStoredReadIds(storageKey));
  const [orders, setOrders] = useState<Order[]>([]); // comenzi reale, pt. link-uri specifice
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(menuRef, () => setMenuOpen(false));
  useClickOutside(searchRef, () => setSearchQuery(''));

  // Aducem comenzile o data, ca sa putem lega notificarile de comenzi reale.
  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  // Ori de cate ori se schimba notificarile citite, le salvam sub cheia userului.
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey, JSON.stringify(readIds));
  }, [user, storageKey, readIds]);

  const title = getPageTitle(location.pathname);
  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();

  // Cautare dupa nume client / numar comanda. Deocamdata doar afiseaza
  // rezultatele intr-o lista, fara vreo actiune la selectare.
  const searchTerm = searchQuery.trim().toLowerCase();
  const searchResults = searchTerm
    ? orders
        .filter(
          (o) =>
            o.externalOrderId.toLowerCase().includes(searchTerm) ||
            (o.customerName ?? '').toLowerCase().includes(searchTerm),
        )
        .slice(0, 6)
    : [];

  // ID-urile notificarilor de tip 'order', in ordine - le mapam pe comenzi reale.
  const orderNotifIds = MOCK_NOTIFICATIONS.filter((n) => n.target.type === 'order').map(
    (n) => n.id,
  );

  /** Gaseste comanda reala asociata unei notificari de tip 'order'. */
  const resolveOrder = (n: Notification): Order | null => {
    const target = n.target;
    if (target.type !== 'order') return null;
    // daca notificarea vizeaza o platforma anume, preferam o comanda de acolo
    if (target.platform) {
      const match = orders.find((o) => o.platform === target.platform);
      if (match) return match;
    }
    const index = orderNotifIds.indexOf(n.id);
    return orders[index] ?? orders[0] ?? null;
  };

  /** Rezolva destinatia unei notificari (null = fara actiune). */
  const resolveLink = (n: Notification): string | null => {
    if (n.target.type === 'route') return n.target.path;
    if (n.target.type === 'order') {
      const order = resolveOrder(n);
      // daca avem o comanda reala -> pagina ei; altfel, lista de comenzi
      return order ? `/orders/${order.id}` : '/orders';
    }
    return null;
  };

  /** Textul afisat: pentru comenzi, adauga numarul comenzii (#externalOrderId). */
  const displayTitle = (n: Notification): string => {
    const order = resolveOrder(n);
    return order ? `${n.title} #${order.externalOrderId}` : n.title;
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !readIds.includes(n.id)).length;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNotificationClick = (n: Notification) => {
    // marcheaza ca citita (scoate bold-ul)
    setReadIds((prev) => (prev.includes(n.id) ? prev : [...prev, n.id]));

    const link = resolveLink(n);
    if (link) {
      setNotifOpen(false); // inchide dropdown-ul
      navigate(link); // redirectioneaza catre comanda/pagina relevanta
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Cautare dupa nume client / numar comanda */}
        <div ref={searchRef} className="relative hidden sm:block">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
            <IconSearch className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cauta client sau nr. comanda..."
            className="w-56 rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {searchTerm && (
            <div className="absolute left-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
              {searchResults.length === 0 ? (
                <p className="px-4 py-2 text-sm text-slate-400">Niciun rezultat</p>
              ) : (
                searchResults.map((o) => (
                  <div key={o.id} className="px-4 py-2">
                    <p className="text-sm text-slate-700">
                      {o.customerName ?? 'Client necunoscut'}
                    </p>
                    <p className="text-xs text-slate-400">#{o.externalOrderId}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notificari */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((open) => !open)}
            className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
            title="Notificari"
          >
            <IconBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Notificari
              </p>
              {MOCK_NOTIFICATIONS.map((n) => {
                const openable = resolveLink(n) !== null;
                const isRead = readIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className="flex w-full items-start justify-between gap-2 px-4 py-2 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span
                        className={`block text-sm ${
                          isRead
                            ? 'font-normal text-slate-600'
                            : 'font-semibold text-slate-900'
                        }`}
                      >
                        {displayTitle(n)}
                      </span>
                      <span className="block text-xs text-slate-400">{n.time}</span>
                    </span>
                    <span className="mt-1 flex shrink-0 items-center gap-2">
                      {!isRead && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                      {openable && <span className="text-blue-600">&rarr;</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Meniu utilizator */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-sm text-slate-700 sm:block">{user?.name}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              >
                Deconectare
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
