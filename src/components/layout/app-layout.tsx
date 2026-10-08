import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  Clock3,
  FileSpreadsheet,
  Gauge,
  LogOut,
  Menu,
  Settings2,
  Upload,
  UserRoundCog,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Brand } from '../brand';
import { useAuth } from '../../features/auth/auth-context';
import type { UserRole } from '../../shared/api/types';
import { appRoutes } from '../../shared/routes/app-routes';
import { ThemeToggle } from '../../features/theme/theme-toggle';

const navigation: Array<{
  label: string;
  path: string;
  icon: typeof Gauge;
  roles?: UserRole[];
}> = [
  { label: 'Visão geral', path: appRoutes.dashboard, icon: Gauge },
  { label: 'Headcount', path: appRoutes.headcount, icon: UsersRound },
  { label: 'Turnover', path: appRoutes.turnover, icon: BriefcaseBusiness },
  { label: 'Banco de horas', path: appRoutes.bankHours, icon: Clock3 },
  { label: 'Absenteísmo', path: appRoutes.absenteeism, icon: BarChart3 },
  { label: 'Importações', path: appRoutes.imports, icon: Upload, roles: ['GESTOR', 'ANALISTA'] },
  { label: 'Funcionários', path: appRoutes.employees, icon: FileSpreadsheet, roles: ['GESTOR', 'ANALISTA'] },
  { label: 'Lançamentos', path: appRoutes.entries, icon: Settings2, roles: ['GESTOR', 'ANALISTA'] },
  { label: 'Usuários', path: appRoutes.users, icon: UserRoundCog, roles: ['GESTOR'] },
];

const roleLabels: Record<UserRole, string> = {
  GESTOR: 'Gestor',
  ANALISTA: 'Analista',
  VISUALIZADOR: 'Visualizador',
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  if (!user) return null;
  const items = navigation.filter(({ roles }) => !roles || roles.includes(user.role));
  const title = items.find(({ path }) => path === location.pathname)?.label ?? 'Prolog RH';

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between px-5">
        <Brand compact={collapsed} />
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav aria-label="Navegação principal" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-sky-400/15 text-sky-200 ring-1 ring-inset ring-sky-300/15'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed ? <span>{label}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Sair' : undefined}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed ? 'Sair' : null}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {mobileOpen ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white shadow-2xl transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {sidebar}
      </aside>

      <div className={`transition-[padding] ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <button
              type="button"
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:block"
            >
              <ChevronLeft className={`size-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Recursos Humanos</p>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[user.role]}</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {initials(user.name)}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
