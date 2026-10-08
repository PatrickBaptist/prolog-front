import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  UploadCloud,
  UsersRound,
  XCircle,
} from 'lucide-react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../auth/auth-context';
import { apiErrorMessage } from '../../shared/api/client';
import type {
  AbsenceHoursImportRow,
  ConfirmImportResponse,
  EmployeeImportRow,
  ImportKind,
  ImportRow,
  ImportStatus,
} from './import.types';
import { useConfirmImport, useIgnoreImportIssue, useImportDetail, useImportPreview } from './use-imports';

const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const statusLabel: Record<ImportStatus, string> = {
  VALIDATING: 'Aguardando correções',
  READY: 'Pronta para confirmar',
  IMPORTING: 'Importando',
  COMPLETED: 'Concluída',
  COMPLETED_WITH_ERRORS: 'Concluída com linhas ignoradas',
};

function isEmployeeRow(row: ImportRow): row is EmployeeImportRow {
  return 'name' in row || 'matricula' in row;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;
}

function Metric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'good' | 'bad' | 'warn' }) {
  const tones = {
    default: 'text-slate-950 dark:text-slate-100',
    good: 'text-emerald-700 dark:text-emerald-400',
    bad: 'text-rose-700 dark:text-rose-400',
    warn: 'text-amber-700 dark:text-amber-400',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{number.format(value)}</p>
    </div>
  );
}

function RecordsTable({ kind, rows }: { kind: ImportKind; rows: ImportRow[] }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Prévia das primeiras 20 linhas</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Confira os dados reconhecidos antes de confirmar.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
            {kind === 'employees' ? (
              <tr><th className="px-4 py-3">Linha</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3">Matrícula</th><th className="px-4 py-3">CPF</th><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Departamento</th><th className="px-4 py-3">Função</th></tr>
            ) : (
              <tr><th className="px-4 py-3">Linha</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Funcionário</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Ausências</th><th className="px-4 py-3">Saldo BH</th></tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {rows.map((row) => (
              <tr key={row.rowNumber} className="text-slate-700 dark:text-slate-300">
                <td className="px-4 py-3">{row.rowNumber}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${row.accepted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`}>
                    {row.accepted ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                    {row.accepted ? 'Aceita' : 'Rejeitada'}
                  </span>
                </td>
                {isEmployeeRow(row) ? (
                  <><td className="px-4 py-3">{row.matricula || '—'}</td><td className="px-4 py-3">{row.cpf || '—'}</td><td className="px-4 py-3 font-medium">{row.name || '—'}</td><td className="px-4 py-3">{row.department || '—'}</td><td className="px-4 py-3">{row.jobTitle || '—'}</td></>
                ) : (
                  <><td className="px-4 py-3">{row.employeeCode || '—'}</td><td className="px-4 py-3 font-medium">{row.employeeName || '—'}</td><td className="px-4 py-3">{row.month && row.year ? `${String(row.month).padStart(2, '0')}/${row.year}` : '—'}</td><td className="px-4 py-3">{number.format(row.totalAbsenceHours ?? 0)} h</td><td className={`px-4 py-3 font-medium ${(row.bankBalance ?? 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{number.format(row.bankBalance ?? 0)} h</td></>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuccessSummary({ result, kind, onRestart }: { result: ConfirmImportResponse; kind: ImportKind; onRestart: () => void }) {
  const created = kind === 'employees' ? result.createdEmployees : result.createdApurations;
  const updated = kind === 'employees' ? result.updatedEmployees : result.updatedApurations;
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 dark:border-emerald-900 dark:bg-emerald-950/30">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><FileCheck2 className="size-6" /></div>
          <h2 className="mt-4 text-xl font-bold text-emerald-950 dark:text-emerald-100">Importação concluída</h2>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">Os dados aceitos já estão disponíveis no sistema e nos dashboards.</p>
        </div>
        <button type="button" onClick={onRestart} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:text-emerald-200"><RefreshCw className="size-4" /> Nova importação</button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Processadas" value={result.processedRows} />
        <Metric label="Criadas" value={created ?? 0} tone="good" />
        <Metric label="Atualizadas" value={updated ?? 0} />
        <Metric label="Ignoradas" value={result.skippedRows} tone={result.skippedRows ? 'warn' : 'default'} />
      </div>
    </section>
  );
}

export function ImportPage() {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<ImportKind>('employees');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [importId, setImportId] = useState<string>();
  const [resolutionIssueId, setResolutionIssueId] = useState<string>();
  const [resolution, setResolution] = useState('');
  const [result, setResult] = useState<ConfirmImportResponse>();
  const preview = useImportPreview();
  const detail = useImportDetail(kind, importId);
  const confirmImport = useConfirmImport();
  const ignoreIssue = useIgnoreImportIssue(kind, importId);

  function restart(nextKind = kind) {
    setKind(nextKind);
    setFile(null);
    setFileError('');
    setImportId(undefined);
    setResolutionIssueId(undefined);
    setResolution('');
    setResult(undefined);
    preview.reset();
    confirmImport.reset();
  }

  function chooseFile(selected?: File) {
    setFileError('');
    setImportId(undefined);
    setResult(undefined);
    preview.reset();
    if (!selected) return setFile(null);
    if (!selected.name.toLowerCase().endsWith('.xlsx')) {
      setFile(null);
      return setFileError('Escolha uma planilha no formato .xlsx.');
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      return setFileError('A planilha precisa ter no máximo 5 MB.');
    }
    setFile(selected);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    chooseFile(event.dataTransfer.files?.[0]);
  }

  async function analyze() {
    if (!file) return setFileError('Escolha a planilha antes de continuar.');
    try {
      const response = await preview.mutateAsync({ kind, file });
      setImportId(response.import.id);
    } catch {
      // A mensagem é apresentada pelo estado da mutation.
    }
  }

  async function resolveIssue() {
    if (!resolutionIssueId || resolution.trim().length < 5) return;
    try {
      await ignoreIssue.mutateAsync({ issueId: resolutionIssueId, resolution });
      setResolutionIssueId(undefined);
      setResolution('');
    } catch {
      // A mensagem é apresentada pelo estado da mutation.
    }
  }

  async function confirm() {
    if (!importId) return;
    try {
      setResult(await confirmImport.mutateAsync({ kind, importId }));
    } catch {
      // A mensagem é apresentada pelo estado da mutation.
    }
  }

  const current = detail.data;
  const rows = current?.records ?? preview.data?.preview ?? [];
  const summary = current
    ? { totalRows: current.totalRows, acceptedRows: current.acceptedRows, rejectedRows: current.rejectedRows, warningRows: current.warningRows }
    : preview.data?.import;
  const busy = preview.isPending || confirmImport.isPending;

  if (result) return <SuccessSummary result={result} kind={kind} onRestart={() => restart()} />;

  return (
    <section className="mx-auto max-w-[1500px] space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">Entrada de dados</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">Importar planilhas</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">O arquivo é analisado primeiro. Nada é gravado nos cadastros até você conferir e confirmar.</p>
      </div>

      {!importId ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => restart('employees')} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${kind === 'employees' ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-100 dark:bg-sky-950/30 dark:ring-sky-950' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'}`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UsersRound className="size-5" /></span>
              <span><strong className="block text-slate-950 dark:text-slate-100">Funcionários</strong><small className="mt-1 block text-slate-500 dark:text-slate-400">Base: Relação de Funcionários.xlsx</small></span>
              <ChevronRight className="ml-auto size-5 text-slate-400" />
            </button>
            <button type="button" onClick={() => restart('absenceHours')} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${kind === 'absenceHours' ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-100 dark:bg-sky-950/30 dark:ring-sky-950' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'}`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><FileSpreadsheet className="size-5" /></span>
              <span><strong className="block text-slate-950 dark:text-slate-100">Absenteísmo e banco de horas</strong><small className="mt-1 block text-slate-500 dark:text-slate-400">Base: ABS_BH Consolidado.xlsx</small></span>
              <ChevronRight className="ml-auto size-5 text-slate-400" />
            </button>
          </div>

          <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-sky-400 dark:border-slate-700 dark:bg-slate-900 sm:p-12">
            <input ref={fileInput} className="sr-only" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFileChange} />
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UploadCloud className="size-7" /></div>
            {file ? (
              <><p className="mt-5 font-semibold text-slate-900 dark:text-slate-100">{file.name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p></>
            ) : (
              <><p className="mt-5 font-semibold text-slate-900 dark:text-slate-100">Arraste a planilha aqui</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ou escolha um arquivo .xlsx de até 5 MB</p></>
            )}
            <button type="button" onClick={() => fileInput.current?.click()} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{file ? 'Trocar arquivo' : 'Escolher arquivo'}</button>
            {fileError ? <p role="alert" className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-400">{fileError}</p> : null}
          </div>
          {preview.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{apiErrorMessage(preview.error)}</div> : null}
          <div className="flex justify-end"><Button type="button" onClick={() => void analyze()} disabled={!file || busy}>{preview.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />}{preview.isPending ? 'Analisando planilha...' : 'Analisar planilha'}</Button></div>
        </>
      ) : null}

      {importId && (detail.isLoading || !summary) ? <div className="grid min-h-52 place-items-center text-slate-500"><LoaderCircle className="size-7 animate-spin" /></div> : null}

      {importId && summary ? (
        <>
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
            <div><p className="font-semibold text-slate-900 dark:text-slate-100">{current?.originalFilename ?? preview.data?.import.filename}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aba: {current?.sheetName ?? preview.data?.import.sheetName} · {current ? statusLabel[current.status] : 'Analisada'}</p></div>
            <button type="button" onClick={() => restart()} className="text-sm font-semibold text-sky-700 dark:text-sky-400">Escolher outro arquivo</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-4"><Metric label="Total de linhas" value={summary.totalRows} /><Metric label="Linhas aceitas" value={summary.acceptedRows} tone="good" /><Metric label="Linhas rejeitadas" value={summary.rejectedRows} tone={summary.rejectedRows ? 'bad' : 'default'} /><Metric label="Linhas com avisos" value={summary.warningRows} tone={summary.warningRows ? 'warn' : 'default'} /></div>

          {preview.data?.unknownColumns.length ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"><strong>Colunas não utilizadas:</strong> {preview.data.unknownColumns.join(', ')}</div> : null}

          {current?.issues.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Problemas encontrados</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Erros pendentes impedem a confirmação. Apenas o gestor pode autorizar que uma linha inválida seja ignorada.</p></div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {current.issues.map((issue) => (
                  <div key={issue.id} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <span className={`mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${issue.severity === 'ERROR' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}><AlertTriangle className="size-3.5" />{issue.severity === 'ERROR' ? 'Erro' : 'Aviso'}</span>
                      <div className="flex-1"><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{issue.message}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{issue.rowNumber ? `Linha ${issue.rowNumber} · ` : ''}{issue.code}{issue.status === 'IGNORED' ? ` · Ignorado: ${issue.resolution}` : ''}</p></div>
                      {user?.role === 'GESTOR' && issue.status === 'PENDING' && issue.severity === 'ERROR' ? <button type="button" onClick={() => { setResolutionIssueId(issue.id); setResolution(''); }} className="text-sm font-semibold text-rose-700 dark:text-rose-400">Ignorar linha</button> : null}
                    </div>
                    {resolutionIssueId === issue.id ? <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Justificativa<input autoFocus value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Explique por que esta linha não será importada" className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-950" /></label>{ignoreIssue.isError ? <p className="mt-2 text-xs text-rose-600">{apiErrorMessage(ignoreIssue.error)}</p> : null}<div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setResolutionIssueId(undefined)} className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancelar</button><button type="button" disabled={resolution.trim().length < 5 || ignoreIssue.isPending} onClick={() => void resolveIssue()} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirmar exclusão da linha</button></div></div> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <RecordsTable kind={kind} rows={rows} />
          {detail.isError || confirmImport.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{apiErrorMessage(detail.error ?? confirmImport.error)}</div> : null}
          <div className="flex flex-col items-end gap-2"><Button type="button" onClick={() => void confirm()} disabled={current?.status !== 'READY' || confirmImport.isPending}>{confirmImport.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{confirmImport.isPending ? 'Gravando dados...' : 'Confirmar importação'}</Button>{current?.status === 'VALIDATING' ? <p className="text-xs text-amber-700 dark:text-amber-400">Resolva todos os erros antes de confirmar.</p> : null}</div>
        </>
      ) : null}
    </section>
  );
}
