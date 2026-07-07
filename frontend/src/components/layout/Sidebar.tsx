import { NavLink } from 'react-router-dom';
import { NAV_GROUPS } from './navConfig';
import { IconChevronDoubleLeft } from './icons';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          Z
        </div>
        {!collapsed && <span className="font-semibold text-slate-800">ZangConnect</span>}
      </div>

      {/* Navigatie grupata */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Buton restrange/extinde */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Extinde' : 'Restrange'}
        className={`flex h-12 items-center gap-3 border-t border-slate-200 px-4 text-sm text-slate-500 hover:bg-slate-100 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <IconChevronDoubleLeft
          className={`h-5 w-5 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
        {!collapsed && <span>Restrange</span>}
      </button>
    </aside>
  );
}
