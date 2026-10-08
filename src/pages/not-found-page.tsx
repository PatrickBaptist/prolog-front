import { Link } from 'react-router-dom';
import { appRoutes } from '../shared/routes/app-routes';
import { ThemeToggle } from '../features/theme/theme-toggle';

export function NotFoundPage() {
  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-6 text-center dark:bg-slate-950">
      <ThemeToggle className="absolute right-5 top-5" />
      <div>
        <p className="text-sm font-bold text-sky-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">Página não encontrada</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">O endereço informado não existe.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-500 dark:text-slate-950" to={appRoutes.dashboard}>
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
