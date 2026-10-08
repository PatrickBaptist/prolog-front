import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Brand } from './brand';

afterEach(cleanup);

describe('Brand', () => {
  it('mostra o nome completo quando não está compacto', () => {
    render(<Brand />);
    expect(screen.getByText('Prolog RH')).toBeInTheDocument();
    expect(screen.getByText('Indicadores de pessoas')).toBeInTheDocument();
  });

  it('oculta os textos no modo compacto', () => {
    render(<Brand compact />);
    expect(screen.queryByText('Prolog RH')).not.toBeInTheDocument();
    expect(screen.getByText('RH')).toBeInTheDocument();
  });
});
