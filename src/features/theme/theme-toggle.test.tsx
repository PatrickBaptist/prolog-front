import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './theme-context';
import { ThemeToggle } from './theme-toggle';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('prolog:theme', 'light');
  document.documentElement.classList.remove('dark');
});

afterEach(cleanup);

describe('ThemeToggle', () => {
  it('ativa o modo escuro e guarda a preferência', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('prolog:theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeInTheDocument();
  });
});
