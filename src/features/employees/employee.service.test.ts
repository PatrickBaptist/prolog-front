import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../shared/api/client';
import { employeeService } from './employee.service';
import type { EmployeePayload } from './employee.types';

vi.mock('../../shared/api/client', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

const payload: EmployeePayload = { name: 'Funcionário de Teste', cpf: '52998224725', status: 'ATIVO' };

describe('employeeService', () => {
  it('lista funcionários com busca, situação e paginação', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], pagination: {} } });
    const params = { search: '52998224725', status: 'ATIVO' as const, page: 1, pageSize: 20 };
    await employeeService.list(params);
    expect(api.get).toHaveBeenCalledWith('/employees', { params });
  });

  it('cadastra e atualiza pela camada de serviço', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    await employeeService.create(payload);
    await employeeService.update('employee-1', payload);
    expect(api.post).toHaveBeenCalledWith('/employees', payload);
    expect(api.patch).toHaveBeenCalledWith('/employees/employee-1', payload);
  });
});
