import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../shared/api/client';
import { importService } from './import.service';

vi.mock('../../shared/api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

beforeEach(() => vi.clearAllMocks());

describe('importService', () => {
  it('envia funcionários como multipart para a rota de prévia', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { import: { id: 'import-1' } } });
    const file = new File(['planilha'], 'Relação de Funcionários.xlsx');

    await importService.preview('employees', file);

    const [url, body] = vi.mocked(api.post).mock.calls[0];
    expect(url).toBe('/imports/employees/preview');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
  });

  it('usa as rotas de ABS/BH e um tempo compatível com o backend', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    await importService.detail('absenceHours', 'import-2');
    await importService.confirm('absenceHours', 'import-2');

    expect(api.get).toHaveBeenCalledWith('/imports/absence-hours/import-2');
    expect(api.post).toHaveBeenCalledWith(
      '/imports/absence-hours/import-2/confirm',
      undefined,
      { timeout: 190_000 },
    );
  });

  it('envia a justificativa ao ignorar um problema', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} });

    await importService.ignoreIssue('import-3', 'issue-1', 'Linha inválida na origem.');

    expect(api.patch).toHaveBeenCalledWith('/imports/import-3/issues/issue-1/ignore', {
      resolution: 'Linha inválida na origem.',
    });
  });
});
