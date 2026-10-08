import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { apiErrorMessage } from '../../shared/api/client';
import type { EmployeeDetail, EmployeePayload } from './employee.types';
import { useEmployee, useSaveEmployee } from './use-employees';

function validCpf(value: string) {
  const cpf = value.replace(/\D/g, '').padStart(11, '0');
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

const optional = z.string();
const schema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo.'),
  cpf: z.string().min(1, 'Informe o CPF.').refine(validCpf, 'O CPF é inválido.'),
  matricula: optional,
  status: z.enum(['ATIVO', 'AFASTADO', 'DEMITIDO']),
  gender: optional, raceColor: optional, maritalStatus: optional, birthDate: optional,
  workCard: optional, driverLicense: optional, identityDocument: optional, pisPasep: optional,
  education: optional, fatherName: optional, motherName: optional, address: optional,
  district: optional, zipCode: optional, city: optional, birthCity: optional,
  department: optional, jobTitle: optional, cbo: optional, startDate: optional, endDate: optional,
  dismissalReason: optional, employmentType: optional, salaryBase: optional,
}).superRefine((values, context) => {
  const hasContract = values.department || values.jobTitle || values.startDate;
  if (!hasContract) return;
  for (const [field, message] of [['department', 'Informe o departamento.'], ['jobTitle', 'Informe a função.'], ['startDate', 'Informe a admissão.']] as const) {
    if (!values[field]) context.addIssue({ code: 'custom', path: [field], message });
  }
  if (values.startDate && values.endDate && values.endDate < values.startDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'A demissão não pode ser anterior à admissão.' });
  if (values.salaryBase && (!Number.isFinite(Number(values.salaryBase.replace(',', '.'))) || Number(values.salaryBase.replace(',', '.')) < 0)) context.addIssue({ code: 'custom', path: ['salaryBase'], message: 'Informe um salário válido.' });
});

type FormData = z.infer<typeof schema>;

const emptyValues: FormData = {
  name: '', cpf: '', matricula: '', status: 'ATIVO', gender: '', raceColor: '', maritalStatus: '', birthDate: '',
  workCard: '', driverLicense: '', identityDocument: '', pisPasep: '', education: '', fatherName: '', motherName: '',
  address: '', district: '', zipCode: '', city: '', birthCity: '', department: '', jobTitle: '', cbo: '', startDate: '',
  endDate: '', dismissalReason: '', employmentType: '', salaryBase: '',
};

function isoDate(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function valuesFromEmployee(employee: EmployeeDetail): FormData {
  const personal = employee.dadosPessoais;
  const contract = employee.contratos[0];
  return {
    name: employee.nome,
    cpf: personal?.cpf ?? '',
    matricula: employee.matriculaAtual ?? '',
    status: employee.status,
    gender: personal?.sexo ?? '', raceColor: personal?.racaCor ?? '', maritalStatus: personal?.estadoCivil ?? '', birthDate: isoDate(personal?.dataNascimento),
    workCard: personal?.carteiraTrabalho ?? '', driverLicense: personal?.carteiraHabilitacao ?? '', identityDocument: personal?.identidade ?? '', pisPasep: personal?.pisPasep ?? '',
    education: personal?.grauInstrucao ?? '', fatherName: personal?.nomePai ?? '', motherName: personal?.nomeMae ?? '', address: personal?.endereco ?? '',
    district: personal?.bairro ?? '', zipCode: personal?.cep ?? '', city: personal?.cidade ?? '', birthCity: personal?.municipioNasc ?? '',
    department: contract?.departamento ?? '', jobTitle: contract?.funcao ?? '', cbo: contract?.cbo ?? '', startDate: isoDate(contract?.dataInicio),
    endDate: isoDate(contract?.dataFim), dismissalReason: contract?.motivoDemissao ?? '', employmentType: contract?.tipoVinculo ?? '', salaryBase: contract?.salarioBase?.toString() ?? '',
  };
}

const nullable = (value: string) => value.trim() || null;

function payload(values: FormData, includeContract: boolean): EmployeePayload {
  return {
    name: values.name.trim(),
    cpf: values.cpf,
    matricula: nullable(values.matricula),
    status: values.status,
    personal: {
      gender: nullable(values.gender), raceColor: nullable(values.raceColor), maritalStatus: nullable(values.maritalStatus), birthDate: nullable(values.birthDate),
      workCard: nullable(values.workCard), driverLicense: nullable(values.driverLicense), identityDocument: nullable(values.identityDocument), pisPasep: nullable(values.pisPasep),
      education: nullable(values.education), fatherName: nullable(values.fatherName), motherName: nullable(values.motherName), address: nullable(values.address),
      district: nullable(values.district), zipCode: nullable(values.zipCode), city: nullable(values.city), birthCity: nullable(values.birthCity),
    },
    ...(includeContract ? { contract: {
      department: values.department.trim(), jobTitle: values.jobTitle.trim(), cbo: nullable(values.cbo), startDate: values.startDate,
      endDate: nullable(values.endDate), dismissalReason: nullable(values.dismissalReason), employmentType: nullable(values.employmentType),
      salaryBase: values.salaryBase ? Number(values.salaryBase.replace(',', '.')) : null,
    } } : {}),
  };
}

export function EmployeeFormDialog({ employeeId, onClose }: { employeeId?: string; onClose: (saved?: boolean) => void }) {
  const detail = useEmployee(employeeId);
  const save = useSaveEmployee();
  const [includeContract, setIncludeContract] = useState(false);
  const { register, reset, setValue, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: emptyValues });

  useEffect(() => {
    if (detail.data) {
      reset(valuesFromEmployee(detail.data));
      setIncludeContract(Boolean(detail.data.contratos.length));
    }
  }, [detail.data, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: employeeId, payload: payload(values, includeContract) });
      onClose(true);
    } catch {
      // A mensagem é exibida pelo estado da mutation.
    }
  });

  const existingContract = Boolean(detail.data?.contratos.length);
  function toggleContract(enabled: boolean) {
    if (existingContract) return;
    setIncludeContract(enabled);
    if (!enabled) {
      for (const field of ['department', 'jobTitle', 'cbo', 'startDate', 'endDate', 'dismissalReason', 'employmentType', 'salaryBase'] as const) setValue(field, '');
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !save.isPending) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="employee-form-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">Alimentação manual</p><h2 id="employee-form-title" className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-100">{employeeId ? 'Editar funcionário' : 'Novo funcionário'}</h2></div>
          <button type="button" aria-label="Fechar" disabled={save.isPending} onClick={() => onClose()} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="size-5" /></button>
        </header>

        {employeeId && detail.isLoading ? <div className="grid min-h-80 place-items-center text-slate-500"><LoaderCircle className="size-7 animate-spin" /></div> : null}
        {detail.isError ? <div className="m-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{apiErrorMessage(detail.error)}</div> : null}

        {(!employeeId || detail.data) ? <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-6">
            <fieldset><legend className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Identificação</legend><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><div className="lg:col-span-2"><Field label="Nome completo *" error={errors.name?.message} {...register('name')} /></div><Field label="CPF *" placeholder="000.000.000-00" error={errors.cpf?.message} {...register('cpf')} /><Field label="Matrícula" error={errors.matricula?.message} {...register('matricula')} /><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Situação *<select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-sky-950" {...register('status')}><option value="ATIVO">Ativo</option><option value="AFASTADO">Afastado</option><option value="DEMITIDO">Demitido</option></select></label><Field label="Nascimento" type="date" error={errors.birthDate?.message} {...register('birthDate')} /><Field label="Gênero" {...register('gender')} /><Field label="Raça/cor" {...register('raceColor')} /><Field label="Estado civil" {...register('maritalStatus')} /><Field label="Escolaridade" {...register('education')} /><Field label="Cidade" {...register('city')} /><Field label="Município de nascimento" {...register('birthCity')} /></div></fieldset>

            <fieldset><legend className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Documentos e endereço</legend><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Identidade" {...register('identityDocument')} /><Field label="PIS/PASEP" {...register('pisPasep')} /><Field label="Carteira de trabalho" {...register('workCard')} /><Field label="CNH" {...register('driverLicense')} /><div className="lg:col-span-2"><Field label="Endereço" {...register('address')} /></div><Field label="Bairro" {...register('district')} /><Field label="CEP" {...register('zipCode')} /><div className="lg:col-span-2"><Field label="Nome do pai" {...register('fatherName')} /></div><div className="lg:col-span-2"><Field label="Nome da mãe" {...register('motherName')} /></div></div></fieldset>

            <fieldset><div className="mb-4 flex items-center justify-between gap-4"><legend className="font-semibold text-slate-900 dark:text-slate-100">Contrato atual</legend><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={includeContract} disabled={existingContract} onChange={(event) => toggleContract(event.target.checked)} className="size-4 accent-sky-600 disabled:opacity-60" /> {existingContract ? 'Contrato existente' : 'Informar contrato'}</label></div>{includeContract ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Departamento *" error={errors.department?.message} {...register('department')} /><Field label="Função *" error={errors.jobTitle?.message} {...register('jobTitle')} /><Field label="CBO" {...register('cbo')} /><Field label="Tipo de vínculo" {...register('employmentType')} /><Field label="Admissão *" type="date" error={errors.startDate?.message} {...register('startDate')} /><Field label="Demissão" type="date" error={errors.endDate?.message} {...register('endDate')} /><Field label="Salário-base" inputMode="decimal" error={errors.salaryBase?.message} {...register('salaryBase')} /><Field label="Motivo da demissão" {...register('dismissalReason')} /></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">O funcionário será salvo sem contrato. Ele não entrará no cálculo contratual de headcount até que um contrato seja informado.</p>}</fieldset>
          </div>
          <footer className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>{save.isError ? <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{apiErrorMessage(save.error)}</p> : <p className="text-xs text-slate-500 dark:text-slate-400">Os campos com * são obrigatórios.</p>}</div>
            <div className="flex justify-end gap-3"><button type="button" disabled={save.isPending} onClick={() => onClose()} className="min-h-11 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button><Button type="submit" disabled={save.isPending}>{save.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{save.isPending ? 'Salvando...' : 'Salvar funcionário'}</Button></div>
          </footer>
        </form> : null}
      </section>
    </div>
  );
}
