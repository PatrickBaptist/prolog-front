export type ImportKind = 'employees' | 'absenceHours';
export type ImportStatus = 'UPLOADED' | 'MAPPING' | 'VALIDATING' | 'READY' | 'IMPORTING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED' | 'CANCELLED';

export interface ImportSummary {
  id: string;
  status: ImportStatus;
  filename: string;
  sheetName: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  warningRows: number;
}

export interface EmployeeImportRow {
  rowNumber: number;
  accepted: boolean;
  matricula?: string | null;
  cpf?: string | null;
  name?: string;
  status?: string;
  department?: string | null;
  jobTitle?: string | null;
  admissionDate?: string | null;
  dismissalDate?: string | null;
}

export interface AbsenceHoursImportRow {
  rowNumber: number;
  accepted: boolean;
  employeeCode?: string;
  employeeName?: string | null;
  year?: number;
  month?: number;
  plannedHours?: number;
  workedHours?: number;
  totalAbsenceHours?: number;
  absenteeismPercentage?: number;
  bankBalance?: number;
}

export type ImportRow = EmployeeImportRow | AbsenceHoursImportRow;

export interface ImportPreviewResponse {
  import: ImportSummary;
  unknownColumns: string[];
  issueSummary: Array<{ code: string; count: number }>;
  preview: ImportRow[];
}

export interface ImportIssue {
  id: string;
  rowNumber: number | null;
  columnName: string | null;
  fieldKey: string | null;
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
  status: 'PENDING' | 'IGNORED' | 'RESOLVED';
  resolution: string | null;
  resolvedAt: string | null;
}

export interface ImportDetail extends Omit<ImportSummary, 'filename'> {
  originalFilename: string;
  importedAt: string | null;
  completedAt: string | null;
  issues: ImportIssue[];
  records: ImportRow[];
}

export interface ConfirmImportResponse {
  importId: string;
  status: ImportStatus;
  processedRows: number;
  skippedRows: number;
  createdEmployees?: number;
  updatedEmployees?: number;
  createdApurations?: number;
  updatedApurations?: number;
}

export interface ImportHistoryItem {
  id: string;
  type: 'EMPLOYEES' | 'ABSENCE_HOURS' | 'GENERIC';
  status: ImportStatus;
  originalFilename: string;
  sheetName: string | null;
  fileSize: number | null;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  warningRows: number;
  errorMessage: string | null;
  importedAt: string;
  completedAt: string | null;
  createdById: string | null;
  createdBy: { name: string; matricula: string } | null;
  issueCount: number;
}

export interface ImportHistoryResponse {
  items: ImportHistoryItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
