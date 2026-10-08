import { Activity, Clock3, LoaderCircle, RefreshCw, TrendingDown, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDashboardFilters, useDashboardOverview } from '../features/dashboard/use-dashboard';
import { apiErrorMessage } from '../shared/api/client';

const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Activity;
  tone?: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const tones = {
    blue: 'bg-sky-50 text-sky-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></div>
      <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{value}</p>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{helper}</p>
    </article>
  );
}

export function DashboardHomePage() {
  const [year, setYear] = useState<number>();
  const filters = useDashboardFilters();

  useEffect(() => {
    if (!year && filters.data?.years.length) setYear(filters.data.years[0]);
  }, [filters.data, year]);

  const overview = useDashboardOverview(year);

  if (filters.isLoading || (year && overview.isLoading)) {
    return <div className="grid min-h-[55vh] place-items-center text-slate-500 dark:text-slate-400"><LoaderCircle className="size-7 animate-spin" /></div>;
  }

  if (filters.isError || overview.isError) {
    const error = filters.error || overview.error;
    return (
      <section className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-900 dark:bg-slate-900">
        <p className="font-semibold text-rose-700">Não foi possível carregar o painel.</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{apiErrorMessage(error)}</p>
        <button type="button" onClick={() => { void filters.refetch(); void overview.refetch(); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          <RefreshCw className="size-4" /> Tentar novamente
        </button>
      </section>
    );
  }

  const data = overview.data;
  return (
    <section className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-sky-700">Resumo mensal e anual</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Indicadores de pessoas</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Dados consolidados pelas regras configuradas no backend.</p>
        </div>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Ano
          <select value={year ?? ''} onChange={(event) => setYear(Number(event.target.value))} className="min-h-11 min-w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-sky-950">
            {filters.data?.years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Funcionários com apuração" value={number.format(data.summary.employees)} helper="Pessoas com ABS/BH no período" icon={UsersRound} />
            <MetricCard label="Absenteísmo" value={`${percent.format(data.summary.absenteeismPercentage)}%`} helper={`${number.format(data.summary.totalAbsenceHours)} horas de ausência`} icon={Activity} tone="amber" />
            <MetricCard label="Turnover" value={`${percent.format(data.summary.turnover.percentage)}%`} helper={`${data.summary.turnover.admissions} admissões e ${data.summary.turnover.dismissals} demissões`} icon={TrendingDown} tone="rose" />
            <MetricCard label="Saldo do banco" value={`${number.format(data.summary.bankBalanceHours)} h`} helper={currency.format(data.summary.bankBalanceValue)} icon={Clock3} tone={data.summary.bankBalanceHours < 0 ? 'rose' : 'green'} />
          </div>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Evolução mensal</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prévia dos dados que alimentarão os gráficos.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr><th className="px-5 py-3">Mês</th><th className="px-5 py-3">Previstas</th><th className="px-5 py-3">Ausências</th><th className="px-5 py-3">Absenteísmo</th><th className="px-5 py-3">Saldo BH</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.monthlyTrend.map((item) => (
                    <tr key={item.month} className="text-slate-700 hover:bg-slate-50/70 dark:text-slate-300 dark:hover:bg-slate-800/60">
                      <td className="px-5 py-3 font-medium capitalize">{new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year ?? 2000, item.month - 1, 1)))}</td>
                      <td className="px-5 py-3">{number.format(item.plannedHours)} h</td>
                      <td className="px-5 py-3">{number.format(item.totalAbsenceHours)} h</td>
                      <td className="px-5 py-3">{percent.format(item.absenteeismPercentage)}%</td>
                      <td className={`px-5 py-3 font-medium ${item.bankBalanceHours < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{number.format(item.bankBalanceHours)} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Ainda não existem períodos disponíveis.</div>
      )}
    </section>
  );
}
