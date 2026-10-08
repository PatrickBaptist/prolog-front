import { ChevronLeft, ChevronRight, LoaderCircle, Pencil, Plus, RefreshCw, Search, UsersRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/button';
import { apiErrorMessage } from '../../shared/api/client';
import { EmployeeFormDialog } from './employee-form-dialog';
import type { EmployeeStatus } from './employee.types';
import { useEmployees } from './use-employees';

const statusLabel: Record<EmployeeStatus, string> = { ATIVO: 'Ativo', AFASTADO: 'Afastado', DEMITIDO: 'Demitido' };
const statusTone: Record<EmployeeStatus, string> = {
  ATIVO: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  AFASTADO: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  DEMITIDO: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

function cpf(value?: string | null) {
  if (!value) return 'Não informado';
  const digits = value.replace(/\D/g, '').padStart(11, '0');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function EmployeePage() {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | EmployeeStatus>('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<'new' | string>();
  const employees = useEmployees({
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    page,
    pageSize: 20,
  });

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchDraft.trim());
    setPage(1);
  }

  return (
    <section className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-sky-700 dark:text-sky-400">Base de pessoas</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Funcionários</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Consulte os dados importados e faça correções manuais quando necessário.</p></div>
        <Button type="button" onClick={() => setDialog('new')}><Plus className="size-4" /> Novo funcionário</Button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_220px_auto] lg:items-end">
        <form onSubmit={submitSearch} className="grid gap-1.5"><label htmlFor="employee-search" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nome, CPF ou matrícula</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input id="employee-search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Digite para pesquisar" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-sky-950" /></div></form>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Situação<select value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="">Todas</option><option value="ATIVO">Ativos</option><option value="AFASTADO">Afastados</option><option value="DEMITIDO">Demitidos</option></select></label>
        <button type="button" onClick={() => { setSearch(searchDraft.trim()); setPage(1); }} className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Pesquisar</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UsersRound className="size-4" /></span><div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Cadastro</h3><p className="text-xs text-slate-500 dark:text-slate-400">{employees.data ? `${employees.data.pagination.total.toLocaleString('pt-BR')} funcionário(s)` : 'Carregando total'}</p></div></div>{employees.isFetching && !employees.isLoading ? <LoaderCircle className="size-4 animate-spin text-slate-400" /> : null}</div>

        {employees.isLoading ? <div className="grid min-h-64 place-items-center text-slate-500"><LoaderCircle className="size-7 animate-spin" /></div> : null}
        {employees.isError ? <div className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><p>{apiErrorMessage(employees.error)}</p><button type="button" onClick={() => void employees.refetch()} className="mt-3 inline-flex items-center gap-2 font-semibold"><RefreshCw className="size-4" /> Tentar novamente</button></div> : null}
        {employees.data?.items.length === 0 ? <div className="p-12 text-center"><UsersRound className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum funcionário encontrado.</p><p className="mt-1 text-xs text-slate-400">Revise os filtros ou faça um novo cadastro.</p></div> : null}

        {employees.data?.items.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/70 dark:text-slate-400"><tr><th className="px-5 py-3">Funcionário</th><th className="px-5 py-3">CPF</th><th className="px-5 py-3">Matrícula</th><th className="px-5 py-3">Departamento</th><th className="px-5 py-3">Função</th><th className="px-5 py-3">Situação</th><th className="px-5 py-3">Origem</th><th className="px-5 py-3 text-right">Ação</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{employees.data.items.map((employee) => { const contract = employee.contratos[0]; return <tr key={employee.id} className="text-slate-700 hover:bg-slate-50/70 dark:text-slate-300 dark:hover:bg-slate-800/50"><td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{employee.nome}</td><td className="px-5 py-4 tabular-nums">{cpf(employee.dadosPessoais?.cpf)}</td><td className="px-5 py-4">{employee.matriculaAtual ?? '—'}</td><td className="px-5 py-4">{contract?.departamento ?? 'Sem contrato'}</td><td className="px-5 py-4">{contract?.funcao ?? '—'}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[employee.status]}`}>{statusLabel[employee.status]}</span></td><td className="px-5 py-4"><span className="text-xs font-medium">{employee.source === 'MANUAL' ? 'Manual' : 'Planilha'}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setDialog(employee.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-600 dark:text-sky-400"><Pencil className="size-3.5" /> Editar</button></td></tr>; })}</tbody></table></div> : null}

        {employees.data && employees.data.pagination.totalPages > 1 ? <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800"><span className="text-slate-500 dark:text-slate-400">Página {employees.data.pagination.page} de {employees.data.pagination.totalPages}</span><div className="flex gap-2"><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="size-4" /></button><button type="button" aria-label="Próxima página" disabled={page >= employees.data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronRight className="size-4" /></button></div></div> : null}
      </div>

      {dialog ? <EmployeeFormDialog employeeId={dialog === 'new' ? undefined : dialog} onClose={() => setDialog(undefined)} /> : null}
    </section>
  );
}
