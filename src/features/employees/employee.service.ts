import { apiRoutes } from '../../shared/api/api-routes';
import { api } from '../../shared/api/client';
import type { EmployeeDetail, EmployeeListResponse, EmployeePayload, EmployeeStatus } from './employee.types';

export const employeeService = {
  async list(params: { search?: string; status?: EmployeeStatus; page: number; pageSize: number }) {
    const { data } = await api.get<EmployeeListResponse>(apiRoutes.employees.list, { params });
    return data;
  },
  async detail(id: string) {
    const { data } = await api.get<EmployeeDetail>(apiRoutes.employees.detail(id));
    return data;
  },
  async create(payload: EmployeePayload) {
    const { data } = await api.post<EmployeeDetail>(apiRoutes.employees.create, payload);
    return data;
  },
  async update(id: string, payload: EmployeePayload) {
    const { data } = await api.patch<EmployeeDetail>(apiRoutes.employees.update(id), payload);
    return data;
  },
};
