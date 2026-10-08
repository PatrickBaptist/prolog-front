import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../shared/api/client';
import { entryService } from './entry.service';
import { absenceCodes, type MonthlyEntryPayload } from './entry.types';

vi.mock('../../shared/api/client', () => ({ api: { get: vi.fn(), put: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

describe('entryService', () => {
  it('consulta uma competência específica antes da edição', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: null });
    await entryService.get('employee-1', 2025, 4);
    expect(api.get).toHaveBeenCalledWith('/employees/employee-1/apurations/2025/4');
  });

  it('envia somente os tipos de ausência aceitos pelo backend', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} });
    const absenceHours = Object.fromEntries(absenceCodes.map((code) => [code, 0])) as MonthlyEntryPayload['absenceHours'];
    const payload: MonthlyEntryPayload = { plannedHours: 176, workedHours: 168, absenceHours };
    await entryService.save('employee-1', 2025, 4, payload);
    expect(Object.keys(absenceHours)).toEqual(absenceCodes);
    expect(api.put).toHaveBeenCalledWith('/employees/employee-1/apurations/2025/4', payload);
  });
});
