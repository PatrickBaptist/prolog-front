import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entryService } from './entry.service';
import type { MonthlyEntryPayload } from './entry.types';

export function useMonthlyEntry(employeeId: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: ['monthly-entry', employeeId, year, month],
    queryFn: () => entryService.get(employeeId!, year, month),
    enabled: Boolean(employeeId) && Number.isInteger(year) && year >= 2000 && year <= 2100 && month >= 1 && month <= 12,
  });
}

export function useSaveMonthlyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, year, month, payload }: { employeeId: string; year: number; month: number; payload: MonthlyEntryPayload }) =>
      entryService.save(employeeId, year, month, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['monthly-entry', variables.employeeId, variables.year, variables.month] });
      await queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-filters'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
}
