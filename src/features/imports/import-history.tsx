import { Ban, ChevronLeft, ChevronRight, LoaderCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { apiErrorMessage } from '../../shared/api/client';
import { useAuth } from '../auth/auth-context';
import type { ImportStatus } from './import.types';
import { useCancelImport, useImportHistory } from './use-imports';

const statusLabels: Record<ImportStatus, string> = {
  UPLOADED: 'Recebida',
  MAPPING: 'Mapeando',
  VALIDATING: 'Com erros',
  READY: 'Pronta',
  IMPORTING: 'Importando',
  COMPLETED: 'Concluída',
  COMPLETED_WITH_ERRORS: 'Concluída com rejeições',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelada',
};

const statusTone: Record<ImportStatus, string> = {
  UPLOADED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  MAPPING: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  VALIDATING: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  READY: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  IMPORTING: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  COMPLETED_WITH_ERRORS: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  FAILED: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  CANCELLED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const cancellable: ImportStatus[] = ['UPLOADED', 'MAPPING', 'VALIDATING', 'READY', 'FAILED'];

export function ImportHistory() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<'' | 'EMPLOYEES' | 'ABSENCE_HOURS'>('');
  const [status, setStatus] = useState<'' | ImportStatus>('');
  const history = useImportHistory({
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    page,
    pageSize: 10,
  });
  const cancelImport = useCancelImport();

  async function cancel(id: string, filename: string) {
    if (!window.confirm(`Cancelar a importação "${filename}"? O registro continuará no histórico.`)) return;
    try {
      await cancelImport.mutateAsync(id);
    } catch {
      // A mensagem é exibida pelo estado da mutation.
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-end">
        <div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Histórico de importações</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">As importações canceladas permanecem registradas para auditoria.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Base<select value={type} onChange={(event) => { setType(event.target.value as typeof type); setPage(1); }} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="">Todas</option><option value="EMPLOYEES">Funcionários</option><option value="ABSENCE_HOURS">ABS/BH</option></select></label>
          <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Situação<select value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"><option value="">Todas</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
      </div>

      {history.isLoading ? <div className="grid min-h-40 place-items-center text-slate-500"><LoaderCircle className="size-6 animate-spin" /></div> : null}
      {history.isError ? <div className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><p>{apiErrorMessage(history.error)}</p><button type="button" onClick={() => void history.refetch()} className="mt-3 inline-flex items-center gap-2 font-semibold"><RefreshCw className="size-4" /> Tentar novamente</button></div> : null}
      {cancelImport.isError ? <div className="mx-5 mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{apiErrorMessage(cancelImport.error)}</div> : null}

      {history.data?.items.length === 0 ? <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Nenhuma importação encontrada.</div> : null}
      {history.data?.items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/70 dark:text-slate-400"><tr><th className="px-5 py-3">Arquivo</th><th className="px-5 py-3">Base</th><th className="px-5 py-3">Situação</th><th className="px-5 py-3">Linhas</th><th className="px-5 py-3">Enviado por</th><th className="px-5 py-3">Data</th><th className="px-5 py-3 text-right">Ação</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.data.items.map((item) => {
                const canCancel = cancellable.includes(item.status) && (user?.role === 'GESTOR' || item.createdById === user?.id);
                return <tr key={item.id} className="text-slate-700 dark:text-slate-300"><td className="px-5 py-4"><p className="max-w-64 truncate font-medium text-slate-900 dark:text-slate-100" title={item.originalFilename}>{item.originalFilename}</p><p className="mt-1 text-xs text-slate-400">{item.sheetName || 'Sem aba identificada'}</p></td><td className="px-5 py-4">{item.type === 'EMPLOYEES' ? 'Funcionários' : item.type === 'ABSENCE_HOURS' ? 'ABS/BH' : 'Outra'}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[item.status]}`}>{statusLabels[item.status]}</span></td><td className="px-5 py-4"><p>{item.acceptedRows} aceitas</p><p className="mt-1 text-xs text-slate-400">{item.rejectedRows} rejeitadas</p></td><td className="px-5 py-4">{item.createdBy?.name ?? 'Sistema'}</td><td className="px-5 py-4">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.importedAt))}</td><td className="px-5 py-4 text-right">{canCancel ? <button type="button" disabled={cancelImport.isPending} onClick={() => void cancel(item.id, item.originalFilename)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 disabled:opacity-50 dark:text-rose-400"><Ban className="size-3.5" /> Cancelar</button> : '—'}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {history.data && history.data.pagination.totalPages > 1 ? <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800"><span className="text-slate-500 dark:text-slate-400">Página {history.data.pagination.page} de {history.data.pagination.totalPages}</span><div className="flex gap-2"><button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="size-4" /></button><button type="button" aria-label="Próxima página" disabled={page >= history.data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronRight className="size-4" /></button></div></div> : null}
    </section>
  );
}
