import { CheckCircle2, ChevronRight, LoaderCircle, Save, Search, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/button';
import { apiErrorMessage } from '../../shared/api/client';
import { useEmployee, useEmployees } from '../employees/use-employees';
import type { EmployeeApuration, EmployeeStatus } from '../employees/employee.types';
import { absenceCodes, absenceLabels, absenteeismCodes, type AbsenceCode, type MonthlyEntryPayload } from './entry.types';
import { useMonthlyEntry, useSaveMonthlyEntry } from './use-entries';

type Values = {
  status: '' | EmployeeStatus; department: string; jobTitle: string; plannedHours: string; workedHours: string;
  normalHours: string; sourceBankHours: string; sourceAbsencePercentage: string; adjustmentBankHours: string;
  adjustmentHours: string; salaryBase: string; absenceHours: Record<AbsenceCode, string>;
};

const emptyAbsences = () => Object.fromEntries(absenceCodes.map((code) => [code, ''])) as Record<AbsenceCode, string>;
const emptyValues = (): Values => ({ status: '', department: '', jobTitle: '', plannedHours: '', workedHours: '', normalHours: '', sourceBankHours: '', sourceAbsencePercentage: '', adjustmentBankHours: '', adjustmentHours: '', salaryBase: '', absenceHours: emptyAbsences() });
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const months = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, index, 1))) }));

function text(value: number | string | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

function valuesFromApuration(apuration?: EmployeeApuration, fallback?: { status: EmployeeStatus; department?: string; jobTitle?: string; salary?: number | string | null }): Values {
  if (!apuration) return { ...emptyValues(), status: fallback?.status ?? '', department: fallback?.department ?? '', jobTitle: fallback?.jobTitle ?? '', salaryBase: text(fallback?.salary) };
  const absenceHours = emptyAbsences();
  if (apuration.absenceEntries.length) {
    for (const entry of apuration.absenceEntries) if (absenceCodes.includes(entry.absenceType.code as AbsenceCode)) absenceHours[entry.absenceType.code as AbsenceCode] = text(entry.hours);
  } else {
    Object.assign(absenceHours, {
      MEDICAL_CERTIFICATE: text(apuration.afastamentos), UNEXCUSED_ABSENCE: text(apuration.faltas), DELAY: text(apuration.atrasos),
      VACATION: text(apuration.ferias), GENERIC_ABSENCE: text(apuration.ausencia), BIRTHDAY_LEAVE: text(apuration.folgaAniversario),
      HOLIDAY: text(apuration.feriado), MARRIAGE_LEAVE: text(apuration.casamento), ALLOWANCE: text(apuration.abono), APPRENTICE_COURSE: text(apuration.cursoAprendiz),
    });
  }
  return {
    status: apuration.statusSnapshot ?? fallback?.status ?? '', department: apuration.departamentoSnapshot ?? fallback?.department ?? '',
    jobTitle: apuration.funcaoSnapshot ?? fallback?.jobTitle ?? '', plannedHours: text(apuration.horasPrevistas), workedHours: text(apuration.horasTrabalhadas),
    normalHours: text(apuration.horasNormais), sourceBankHours: text(apuration.horasBancoFonte), sourceAbsencePercentage: text(apuration.percentualAusenciaFonte),
    adjustmentBankHours: text(apuration.ajusteBH), adjustmentHours: text(apuration.ajuste), salaryBase: text(apuration.salarioBase ?? fallback?.salary), absenceHours,
  };
}

function decimal(value: string, fallback = 0) {
  if (!value.trim()) return fallback;
  return Number(value.replace(',', '.'));
}

function optionalDecimal(value: string) {
  return value.trim() ? Number(value.replace(',', '.')) : null;
}

function NumberField({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}<input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-sky-950" />{hint ? <span className="text-xs font-normal text-slate-400">{hint}</span> : null}</label>;
}

export function EntryPage() {
  const today = new Date();
  const [employeeId, setEmployeeId] = useState<string>();
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [values, setValues] = useState<Values>(emptyValues);
  const [formError, setFormError] = useState('');
  const candidates = useEmployees({ ...(search ? { search } : {}), page: 1, pageSize: 10 });
  const employee = useEmployee(employeeId);
  const period = useMonthlyEntry(employeeId, year, month);
  const save = useSaveMonthlyEntry();
  const existing = period.data ?? undefined;
  const contract = employee.data?.contratos[0];

  useEffect(() => {
    if (!employee.data || period.isLoading) return;
    setValues(valuesFromApuration(existing, { status: employee.data.status, department: contract?.departamento, jobTitle: contract?.funcao, salary: contract?.salarioBase }));
    setFormError('');
  // O id da apuração muda após o salvamento e garante a recarga dos valores confirmados.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.data?.id, period.data, period.isLoading, year, month]);

  const recentPeriods = useMemo(() => employee.data?.apuracoes.slice(0, 6) ?? [], [employee.data]);

  function selectEmployee(id: string) {
    setEmployeeId(id);
    setFormError('');
    save.reset();
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchDraft.trim());
  }

  function update(field: keyof Omit<Values, 'absenceHours'>, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateAbsence(code: AbsenceCode, value: string) {
    setValues((current) => ({ ...current, absenceHours: { ...current.absenceHours, [code]: value } }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!employeeId) return setFormError('Escolha um funcionário.');
    if (!Number.isInteger(year) || year < 2000 || year > 2100 || month < 1 || month > 12) return setFormError('Informe uma competência válida.');
    const plannedHours = decimal(values.plannedHours, Number.NaN);
    const workedHours = decimal(values.workedHours, Number.NaN);
    if (!Number.isFinite(plannedHours) || plannedHours < 0) return setFormError('Informe as horas previstas.');
    if (!Number.isFinite(workedHours) || workedHours < 0) return setFormError('Informe as horas trabalhadas.');
    const absenceHours = Object.fromEntries(absenceCodes.map((code) => [code, decimal(values.absenceHours[code])])) as Record<AbsenceCode, number>;
    if (Object.entries(absenceHours).some(([code, value]) => !Number.isFinite(value) || (code !== 'GENERIC_ABSENCE' && value < 0))) return setFormError('Revise as horas dos tipos de ausência.');
    const payload: MonthlyEntryPayload = {
      status: values.status || null, department: values.department.trim() || null, jobTitle: values.jobTitle.trim() || null,
      plannedHours, workedHours, normalHours: optionalDecimal(values.normalHours), sourceBankHours: optionalDecimal(values.sourceBankHours),
      sourceAbsencePercentage: optionalDecimal(values.sourceAbsencePercentage), adjustmentBankHours: decimal(values.adjustmentBankHours),
      adjustmentHours: decimal(values.adjustmentHours), salaryBase: optionalDecimal(values.salaryBase), absenceHours,
    };
    const allNumbers = [payload.normalHours, payload.sourceBankHours, payload.sourceAbsencePercentage, payload.adjustmentBankHours, payload.adjustmentHours, payload.salaryBase];
    if (allNumbers.some((value) => value !== null && value !== undefined && !Number.isFinite(value))) return setFormError('Existem valores numéricos inválidos.');
    if ((payload.normalHours ?? 0) < 0 || (payload.salaryBase ?? 0) < 0) return setFormError('Horas normais e salário-base não podem ser negativos.');
    try { await save.mutateAsync({ employeeId, year, month, payload }); } catch { /* mensagem abaixo */ }
  }

  if (!employeeId) return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div><p className="text-sm font-semibold text-sky-700 dark:text-sky-400">Alimentação manual</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Lançamento mensal</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Escolha primeiro o funcionário que receberá os dados de absenteísmo e banco de horas.</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input autoFocus value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Pesquise por nome, CPF ou matrícula" className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-sky-950" /></div><Button type="submit">Pesquisar</Button></form>
        {candidates.isLoading ? <div className="grid min-h-48 place-items-center"><LoaderCircle className="size-6 animate-spin text-slate-400" /></div> : null}
        {candidates.isError ? <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{apiErrorMessage(candidates.error)}</p> : null}
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">{candidates.data?.items.map((item) => <button key={item.id} type="button" onClick={() => selectEmployee(item.id)} className="flex w-full items-center gap-4 py-4 text-left"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UserRound className="size-5" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900 dark:text-slate-100">{item.nome}</strong><small className="mt-1 block text-slate-500 dark:text-slate-400">{item.matriculaAtual ? `Matrícula ${item.matriculaAtual}` : 'Sem matrícula'} · {item.contratos[0]?.departamento ?? 'Sem contrato'}</small></span><ChevronRight className="size-4 text-slate-400" /></button>)}</div>
      </div>
    </section>
  );

  return (
    <form onSubmit={submit} className="mx-auto max-w-[1500px] space-y-6" noValidate>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-sky-700 dark:text-sky-400">Alimentação manual</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Lançamento mensal</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Os indicadores serão calculados pelo backend usando a mesma regra das planilhas.</p></div><button type="button" onClick={() => setEmployeeId(undefined)} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-400"><X className="size-4" /> Trocar funcionário</button></div>

      {(employee.isLoading || period.isLoading) ? <div className="grid min-h-60 place-items-center"><LoaderCircle className="size-7 animate-spin text-slate-400" /></div> : null}
      {period.isError ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{apiErrorMessage(period.error)}</div> : null}
      {employee.data && !period.isLoading && !period.isError ? <>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_180px_220px] lg:items-end"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><UserRound className="size-5" /></span><div><p className="font-semibold text-slate-900 dark:text-slate-100">{employee.data.nome}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{employee.data.matriculaAtual ? `Matrícula ${employee.data.matriculaAtual}` : 'Identificação por CPF'} · {contract?.departamento ?? 'Sem contrato'}</p></div></div><label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Ano<input type="number" min="2000" max="2100" value={year} onChange={(event) => { setYear(Number(event.target.value)); save.reset(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label><label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Mês<select value={month} onChange={(event) => { setMonth(Number(event.target.value)); save.reset(); }} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize dark:border-slate-700 dark:bg-slate-950">{months.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>

        {existing ? <div className={`rounded-2xl border p-4 text-sm ${existing.source === 'IMPORT' ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300' : 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300'}`}><strong>Esta competência já possui dados.</strong> {existing.source === 'IMPORT' ? 'Ao salvar, o lançamento passará a ser manual e futuras planilhas não poderão sobrescrevê-lo.' : 'O salvamento atualizará o lançamento manual existente.'}</div> : null}

        {recentPeriods.length ? <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Últimos lançamentos:</span>{recentPeriods.map((item) => <button key={item.id} type="button" onClick={() => { setYear(item.ano); setMonth(item.mes); save.reset(); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.ano === year && item.mes === month ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{String(item.mes).padStart(2, '0')}/{item.ano}</button>)}</div> : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Competência e jornada</h3><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Horas previstas *" value={values.plannedHours} onChange={(value) => update('plannedHours', value)} /><NumberField label="Horas trabalhadas *" value={values.workedHours} onChange={(value) => update('workedHours', value)} /><NumberField label="Horas normais" value={values.normalHours} onChange={(value) => update('normalHours', value)} /><NumberField label="Salário-base" value={values.salaryBase} onChange={(value) => update('salaryBase', value)} /><label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Situação no mês<select value={values.status} onChange={(event) => update('status', event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Usar cadastro atual</option><option value="ATIVO">Ativo</option><option value="AFASTADO">Afastado</option><option value="DEMITIDO">Demitido</option></select></label><label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Departamento<input value={values.department} onChange={(event) => update('department', event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Função<input value={values.jobTitle} onChange={(event) => update('jobTitle', event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label></div></section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Ocorrências em horas</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Somente os tipos marcados entram na fórmula atual de absenteísmo.</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{absenceCodes.map((code) => <NumberField key={code} label={absenceLabels[code]} value={values.absenceHours[code]} onChange={(value) => updateAbsence(code, value)} hint={absenteeismCodes.has(code) ? 'Entra no absenteísmo' : 'Não entra no absenteísmo'} />)}</div></section>

        <details className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><summary className="cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">Campos adicionais da planilha</summary><div className="grid gap-4 border-t border-slate-200 p-5 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Banco de horas da origem" value={values.sourceBankHours} onChange={(value) => update('sourceBankHours', value)} /><NumberField label="Absenteísmo da origem (%)" value={values.sourceAbsencePercentage} onChange={(value) => update('sourceAbsencePercentage', value)} /><NumberField label="Ajuste de BH" value={values.adjustmentBankHours} onChange={(value) => update('adjustmentBankHours', value)} /><NumberField label="Ajuste de horas" value={values.adjustmentHours} onChange={(value) => update('adjustmentHours', value)} /></div></details>

        {(formError || save.isError) ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{formError || apiErrorMessage(save.error)}</div> : null}
        {save.data ? <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"><div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200"><CheckCircle2 className="size-5" /> Lançamento salvo</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-emerald-700 dark:text-emerald-400">Total de ausências</p><strong>{number.format(save.data.totalAbsenceHours)} h</strong></div><div><p className="text-xs text-emerald-700 dark:text-emerald-400">Absenteísmo</p><strong>{number.format(save.data.absenteeismPercentage)}%</strong></div><div><p className="text-xs text-emerald-700 dark:text-emerald-400">Saldo de horas</p><strong>{number.format(save.data.bankBalance)} h</strong></div><div><p className="text-xs text-emerald-700 dark:text-emerald-400">Saldo financeiro</p><strong>{currency.format(save.data.finalBalance)}</strong></div></div></section> : null}
        <div className="flex justify-end"><Button type="submit" disabled={save.isPending}>{save.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{save.isPending ? 'Calculando e salvando...' : existing ? 'Atualizar lançamento' : 'Salvar lançamento'}</Button></div>
      </> : null}
    </form>
  );
}
