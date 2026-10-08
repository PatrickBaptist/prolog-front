import {
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  FileSpreadsheet,
  Settings2,
  UserRoundCog,
  UsersRound,
} from 'lucide-react';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/app-layout';
import { ProtectedRoute } from '../features/auth/protected-route';
import { ModulePlaceholderPage } from '../pages/module-placeholder-page';
import { NotFoundPage } from '../pages/not-found-page';
import { appRoutes } from '../shared/routes/app-routes';

const LoginPage = lazy(() =>
  import('../features/auth/login-page').then(({ LoginPage }) => ({ default: LoginPage })),
);
const FirstAccessPage = lazy(() =>
  import('../features/auth/first-access-page').then(({ FirstAccessPage }) => ({ default: FirstAccessPage })),
);
const DashboardHomePage = lazy(() =>
  import('../pages/dashboard-home-page').then(({ DashboardHomePage }) => ({ default: DashboardHomePage })),
);
const ImportPage = lazy(() =>
  import('../features/imports/import-page').then(({ ImportPage }) => ({ default: ImportPage })),
);

function deferred(content: ReactNode) {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">Carregando...</div>}>
      {content}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: appRoutes.login, element: deferred(<LoginPage />) },
  { path: appRoutes.firstAccess, element: deferred(<FirstAccessPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={appRoutes.dashboard} replace /> },
          { path: appRoutes.dashboard, element: deferred(<DashboardHomePage />) },
          { path: appRoutes.headcount, element: <ModulePlaceholderPage title="Headcount" description="A estrutura está pronta para receber os gráficos de perfil, status e tempo de empresa." icon={UsersRound} /> },
          { path: appRoutes.turnover, element: <ModulePlaceholderPage title="Turnover" description="A estrutura está pronta para receber movimentações, motivos de demissão e evolução mensal." icon={BriefcaseBusiness} /> },
          { path: appRoutes.bankHours, element: <ModulePlaceholderPage title="Banco de horas" description="A estrutura está pronta para receber saldos por mês, departamento e funcionário." icon={Clock3} /> },
          { path: appRoutes.absenteeism, element: <ModulePlaceholderPage title="Absenteísmo" description="A estrutura está pronta para receber o acumulado, o ranking e as ausências por tipo." icon={BarChart3} /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['GESTOR', 'ANALISTA']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: appRoutes.imports, element: deferred(<ImportPage />) },
          { path: appRoutes.employees, element: <ModulePlaceholderPage title="Funcionários" description="Consulta e alimentação manual dos dados permitidos para gestor e analista." icon={FileSpreadsheet} /> },
          { path: appRoutes.entries, element: <ModulePlaceholderPage title="Lançamentos" description="Alimentação manual das apurações mensais e campos adicionais." icon={Settings2} /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['GESTOR']} />,
    children: [
      { element: <AppLayout />, children: [{ path: appRoutes.users, element: <ModulePlaceholderPage title="Usuários" description="Cadastro de analistas, visualizadores e gestão de acessos." icon={UserRoundCog} /> }] },
    ],
  },
  { path: appRoutes.notFound, element: <NotFoundPage /> },
]);
