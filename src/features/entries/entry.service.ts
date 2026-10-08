import { apiRoutes } from '../../shared/api/api-routes';
import { api } from '../../shared/api/client';
import type { MonthlyEntryPayload, MonthlyEntryResult } from './entry.types';
import type { EmployeeApuration } from '../employees/employee.types';

export const entryService = {
  async get(employeeId: string, year: number, month: number) {
    const { data } = await api.get<EmployeeApuration | null>(apiRoutes.employees.monthlyApuration(employeeId, year, month));
    return data;
  },
  async save(employeeId: string, year: number, month: number, payload: MonthlyEntryPayload) {
    const { data } = await api.put<MonthlyEntryResult>(apiRoutes.employees.monthlyApuration(employeeId, year, month), payload);
    return data;
  },
};
