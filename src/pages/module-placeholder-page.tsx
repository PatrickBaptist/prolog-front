import type { LucideIcon } from 'lucide-react';

export function ModulePlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <div className="grid size-12 place-items-center rounded-2xl bg-sky-50 text-sky-700">
          <Icon className="size-6" />
        </div>
        <p className="mt-7 text-sm font-semibold uppercase tracking-wider text-sky-700">Módulo preparado</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        <div className="mt-8 h-2 w-36 rounded-full bg-gradient-to-r from-sky-400 to-blue-600" />
      </div>
    </section>
  );
}
