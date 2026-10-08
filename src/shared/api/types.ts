export type UserRole = 'GESTOR' | 'ANALISTA' | 'VISUALIZADOR';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export type LoginResponse =
  | {
      requiresPasswordChange: false;
      token: string;
      user: AuthUser;
    }
  | {
      requiresPasswordChange: true;
      passwordChangeToken: string;
      user: AuthUser;
    };

export interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface DashboardFiltersResponse {
  years: number[];
  months: number[];
  departments: Array<{ id: string; name: string }>;
  jobRoles: Array<{ id: string; name: string }>;
}

export interface DashboardOverview {
  filters: {
    year: number;
    month?: number;
    departmentId?: string;
    jobRoleId?: string;
  };
  summary: {
    employees: number;
    plannedHours: number;
    totalAbsenceHours: number;
    absenteeismPercentage: number;
    bankBalanceHours: number;
    bankBalanceValue: number;
    turnover: {
      admissions: number;
      dismissals: number;
      openingHeadcount: number;
      closingHeadcount: number;
      movementsAverage: number;
      headcountAverage: number;
      percentage: number;
    };
  };
  monthlyTrend: Array<{
    month: number;
    plannedHours: number;
    totalAbsenceHours: number;
    absenteeismPercentage: number;
    bankBalanceHours: number;
    bankBalanceValue: number;
  }>;
}
