export type EmployeeStatus = 'ATIVO' | 'AFASTADO' | 'DEMITIDO';

export interface EmployeeListItem {
  id: string;
  nome: string;
  matriculaAtual: string | null;
  status: EmployeeStatus;
  source: 'IMPORT' | 'MANUAL';
  dadosPessoais: { cpf: string | null } | null;
  contratos: Array<{ departamento: string; funcao: string; salarioBase: number | string | null }>;
}

export interface EmployeeDetail extends EmployeeListItem {
  provisionalCode: string | null;
  dadosPessoais: {
    cpf: string | null;
    sexo: string | null;
    racaCor: string | null;
    estadoCivil: string | null;
    dataNascimento: string | null;
    carteiraTrabalho: string | null;
    carteiraHabilitacao: string | null;
    identidade: string | null;
    pisPasep: string | null;
    grauInstrucao: string | null;
    nomePai: string | null;
    nomeMae: string | null;
    endereco: string | null;
    bairro: string | null;
    cep: string | null;
    cidade: string | null;
    municipioNasc: string | null;
  } | null;
  contratos: Array<{
    departamento: string;
    funcao: string;
    cbo: string | null;
    dataInicio: string;
    dataFim: string | null;
    motivoDemissao: string | null;
    tipoVinculo: string | null;
    salarioBase: number | string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayload {
  name: string;
  cpf: string;
  matricula?: string | null;
  status: EmployeeStatus;
  personal?: {
    gender?: string | null;
    raceColor?: string | null;
    maritalStatus?: string | null;
    birthDate?: string | null;
    workCard?: string | null;
    driverLicense?: string | null;
    identityDocument?: string | null;
    pisPasep?: string | null;
    education?: string | null;
    fatherName?: string | null;
    motherName?: string | null;
    address?: string | null;
    district?: string | null;
    zipCode?: string | null;
    city?: string | null;
    birthCity?: string | null;
  };
  contract?: {
    department: string;
    jobTitle: string;
    cbo?: string | null;
    startDate: string;
    endDate?: string | null;
    dismissalReason?: string | null;
    employmentType?: string | null;
    salaryBase?: number | null;
  };
}

export interface EmployeeListResponse {
  items: EmployeeListItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
