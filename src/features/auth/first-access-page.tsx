import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Brand } from '../../components/brand';
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { apiErrorMessage, PASSWORD_SETUP_KEY } from '../../shared/api/client';
import { appRoutes } from '../../shared/routes/app-routes';
import { useDefineFirstAccessPassword } from './use-auth-actions';
import { ThemeToggle } from '../theme/theme-toggle';

const passwordRule = z
  .string()
  .min(12, 'Use pelo menos 12 caracteres.')
  .regex(/[a-z]/, 'Inclua uma letra minúscula.')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula.')
  .regex(/\d/, 'Inclua um número.')
  .regex(/[^A-Za-z0-9]/, 'Inclua um símbolo.');

const schema = z
  .object({ password: passwordRule, confirmation: z.string() })
  .refine(({ password, confirmation }) => password === confirmation, {
    path: ['confirmation'],
    message: 'As senhas são diferentes.',
  });

type FormData = z.infer<typeof schema>;

function setupToken() {
  try {
    return (JSON.parse(sessionStorage.getItem(PASSWORD_SETUP_KEY) || '') as { token: string }).token;
  } catch {
    return null;
  }
}

export function FirstAccessPage() {
  const navigate = useNavigate();
  const token = setupToken();
  const definePassword = useDefineFirstAccessPassword();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!token) return <Navigate to={appRoutes.login} replace />;

  const submit = handleSubmit(async ({ password }) => {
    setServerError('');
    try {
      await definePassword.mutateAsync({ password, token });
      sessionStorage.removeItem(PASSWORD_SETUP_KEY);
      navigate(appRoutes.login, { replace: true, state: { passwordDefined: true } });
    } catch (error) {
      setServerError(apiErrorMessage(error));
    }
  });

  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-6 py-12 transition-colors dark:bg-slate-950">
      <ThemeToggle className="absolute right-5 top-5" />
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">
        <Brand />
        <div className="mt-9 flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <KeyRound className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-slate-100">Defina sua senha</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Ela precisa ter 12 caracteres, letra maiúscula, minúscula, número e símbolo.
        </p>
        <form className="mt-7 grid gap-5" onSubmit={submit} noValidate>
          <Field label="Nova senha" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
          <Field label="Confirme a senha" type="password" autoComplete="new-password" error={errors.confirmation?.message} {...register('confirmation')} />
          {serverError ? <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">{serverError}</div> : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isSubmitting ? 'Salvando...' : 'Salvar senha'}
          </Button>
        </form>
      </section>
    </main>
  );
}
