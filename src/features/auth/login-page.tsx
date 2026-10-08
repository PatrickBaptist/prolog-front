import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BarChart3, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Brand } from '../../components/brand';
import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { apiErrorMessage, PASSWORD_SETUP_KEY } from '../../shared/api/client';
import { appRoutes } from '../../shared/routes/app-routes';
import { useAuth } from './auth-context';
import { ThemeToggle } from '../theme/theme-toggle';

const schema = z.object({
  matricula: z.string().trim().min(1, 'Informe a matrícula.'),
  password: z.string().min(1, 'Informe a senha.'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { authenticated, login } = useAuth();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (authenticated) return <Navigate to={appRoutes.dashboard} replace />;

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      const result = await login(values.matricula, values.password);
      if (result.requiresPasswordChange) {
        sessionStorage.setItem(
          PASSWORD_SETUP_KEY,
          JSON.stringify({ token: result.passwordChangeToken, user: result.user }),
        );
        navigate(appRoutes.firstAccess);
        return;
      }
      navigate(appRoutes.dashboard);
    } catch (error) {
      setServerError(apiErrorMessage(error));
    }
  });

  return (
    <main className="relative min-h-screen bg-slate-50 transition-colors dark:bg-slate-950 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <ThemeToggle className="absolute right-5 top-5 z-20" />
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,0.25),transparent_32%)]" />
        <div className="relative"><Brand /></div>
        <div className="relative max-w-xl">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white/10">
            <BarChart3 className="size-7 text-sky-300" />
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Decisões de RH com dados claros e confiáveis.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Importe as planilhas mensais, acompanhe os indicadores e mantenha o histórico em um só lugar.
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="size-4" />
          Acesso controlado por perfil
        </div>
      </section>

      <section className="flex min-h-screen min-w-0 items-center justify-center px-6 py-12 sm:px-10">
        <div className="min-w-0 w-full max-w-md">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <p className="text-sm font-semibold text-sky-700">Bem-vindo</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Entre na sua conta</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Use a matrícula cadastrada pelo gestor e sua senha.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={submit} noValidate>
            <Field
              label="Matrícula"
              autoComplete="username"
              placeholder="Digite sua matrícula"
              error={errors.matricula?.message}
              {...register('matricula')}
            />
            <Field
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              error={errors.password?.message}
              {...register('password')}
            />
            {serverError ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                {serverError}
              </div>
            ) : null}
            <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
