import type { EmployeeStatus } from '../employees/employee.types';

export const absenceCodes = [
  'MEDICAL_CERTIFICATE', 'JUSTIFIED_ABSENCE', 'UNEXCUSED_ABSENCE', 'MEDICAL_ACCOMPANIMENT',
  'PATERNITY_LEAVE', 'CHILD_MEDICAL_APPOINTMENT', 'MATERNITY_LEAVE', 'VACATION',
  'GENERIC_ABSENCE', 'DELAY', 'BIRTHDAY_LEAVE', 'HOLIDAY', 'MARRIAGE_LEAVE',
  'ALLOWANCE', 'APPRENTICE_COURSE',
] as const;

export type AbsenceCode = (typeof absenceCodes)[number];

export const absenceLabels: Record<AbsenceCode, string> = {
  MEDICAL_CERTIFICATE: 'Atestado médico',
  JUSTIFIED_ABSENCE: 'Falta justificada',
  UNEXCUSED_ABSENCE: 'Falta não justificada',
  MEDICAL_ACCOMPANIMENT: 'Acompanhamento médico',
  PATERNITY_LEAVE: 'Licença-paternidade',
  CHILD_MEDICAL_APPOINTMENT: 'Consulta médica de filho',
  MATERNITY_LEAVE: 'Licença-maternidade',
  VACATION: 'Férias',
  GENERIC_ABSENCE: 'Ausência genérica',
  DELAY: 'Atrasos',
  BIRTHDAY_LEAVE: 'Folga de aniversário',
  HOLIDAY: 'Feriado',
  MARRIAGE_LEAVE: 'Licença-casamento',
  ALLOWANCE: 'Abono',
  APPRENTICE_COURSE: 'Curso de aprendiz',
};

export const absenteeismCodes = new Set<AbsenceCode>([
  'MEDICAL_CERTIFICATE', 'JUSTIFIED_ABSENCE', 'UNEXCUSED_ABSENCE', 'MEDICAL_ACCOMPANIMENT',
  'PATERNITY_LEAVE', 'CHILD_MEDICAL_APPOINTMENT', 'MATERNITY_LEAVE',
]);

export interface MonthlyEntryPayload {
  status?: EmployeeStatus | null;
  department?: string | null;
  jobTitle?: string | null;
  plannedHours: number;
  workedHours: number;
  normalHours?: number | null;
  sourceBankHours?: number | null;
  sourceAbsencePercentage?: number | null;
  adjustmentBankHours?: number;
  adjustmentHours?: number;
  salaryBase?: number | null;
  absenceHours: Record<AbsenceCode, number>;
}

export interface MonthlyEntryResult {
  id: string;
  employeeId: string;
  year: number;
  month: number;
  totalAbsenceHours: number;
  absenteeismPercentage: number;
  positiveBankHours: number;
  negativeBankHours: number;
  bankBalance: number;
  hourlyValue: number;
  positiveBankValue: number;
  negativeBankValue: number;
  finalBalance: number;
  salaryBase: number | null;
  source: 'MANUAL';
}
