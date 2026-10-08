import { apiRoutes } from '../../shared/api/api-routes';
import { api } from '../../shared/api/client';
import type { ConfirmImportResponse, ImportDetail, ImportHistoryResponse, ImportKind, ImportPreviewResponse, ImportStatus } from './import.types';

function routes(kind: ImportKind) {
  return kind === 'employees'
    ? {
        preview: apiRoutes.imports.employeesPreview,
        detail: apiRoutes.imports.employee,
        confirm: apiRoutes.imports.employeeConfirm,
      }
    : {
        preview: apiRoutes.imports.absenceHoursPreview,
        detail: apiRoutes.imports.absenceHours,
        confirm: apiRoutes.imports.absenceHoursConfirm,
      };
}

export const importService = {
  async list(params: { type?: 'EMPLOYEES' | 'ABSENCE_HOURS'; status?: ImportStatus; page: number; pageSize: number }) {
    const { data } = await api.get<ImportHistoryResponse>(apiRoutes.imports.list, { params });
    return data;
  },

  async preview(kind: ImportKind, file: File) {
    const body = new FormData();
    body.append('file', file);
    const { data } = await api.post<ImportPreviewResponse>(routes(kind).preview, body);
    return data;
  },

  async detail(kind: ImportKind, importId: string) {
    const { data } = await api.get<ImportDetail>(routes(kind).detail(importId));
    return data;
  },

  async confirm(kind: ImportKind, importId: string) {
    const { data } = await api.post<ConfirmImportResponse>(routes(kind).confirm(importId), undefined, {
      timeout: kind === 'absenceHours' ? 190_000 : 70_000,
    });
    return data;
  },

  async ignoreIssue(importId: string, issueId: string, resolution: string) {
    const { data } = await api.patch(apiRoutes.imports.ignoreIssue(importId, issueId), { resolution });
    return data;
  },

  async cancel(importId: string) {
    const { data } = await api.patch<{ importId: string; status: 'CANCELLED' }>(apiRoutes.imports.cancel(importId));
    return data;
  },
};
