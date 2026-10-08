import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService } from './employee.service';
import type { EmployeePayload, EmployeeStatus } from './employee.types';

export function useEmployees(filters: { search?: string; status?: EmployeeStatus; page: number; pageSize: number }) {
  return useQuery({ queryKey: ['employees', filters], queryFn: () => employeeService.list(filters) });
}

export function useEmployee(id?: string) {
  return useQuery({ queryKey: ['employee', id], queryFn: () => employeeService.detail(id!), enabled: Boolean(id) });
}

export function useSaveEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: EmployeePayload }) =>
      id ? employeeService.update(id, payload) : employeeService.create(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      if (variables.id) await queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-filters'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
}
