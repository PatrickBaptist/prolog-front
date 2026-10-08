import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { importService } from './import.service';
import type { ImportKind, ImportStatus } from './import.types';

export function useImportPreview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, file }: { kind: ImportKind; file: File }) => importService.preview(kind, file),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['imports'] }),
  });
}

export function useImportHistory(filters: { type?: 'EMPLOYEES' | 'ABSENCE_HOURS'; status?: ImportStatus; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ['imports', filters],
    queryFn: () => importService.list(filters),
  });
}

export function useImportDetail(kind: ImportKind, importId?: string) {
  return useQuery({
    queryKey: ['import', kind, importId],
    queryFn: () => importService.detail(kind, importId!),
    enabled: Boolean(importId),
  });
}

export function useConfirmImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, importId }: { kind: ImportKind; importId: string }) =>
      importService.confirm(kind, importId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['imports'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-filters'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
}

export function useIgnoreImportIssue(kind: ImportKind, importId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, resolution }: { issueId: string; resolution: string }) =>
      importService.ignoreIssue(importId!, issueId, resolution),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['import', kind, importId] });
      await queryClient.invalidateQueries({ queryKey: ['imports'] });
    },
  });
}

export function useCancelImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importService.cancel,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['imports'] }),
  });
}
