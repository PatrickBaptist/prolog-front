# Prolog RH — Frontend

Fundação da interface web do sistema de indicadores de Recursos Humanos.

## Tecnologias

- React e TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form e Zod
- Tailwind CSS
- Axios
- Vitest e Testing Library

## Executar localmente

1. Copie `.env.example` para `.env` se o backend não estiver em `http://localhost:3333`.
2. Execute `npm install`.
3. Execute `npm run dev`.
4. Abra `http://127.0.0.1:5173`.

## Comandos

- `npm run dev`: inicia o ambiente local.
- `npm run build`: valida os tipos e gera a versão de produção.
- `npm test`: executa os testes automatizados.

## Estrutura inicial

- `/login`: autenticação por matrícula e senha.
- `/primeiro-acesso`: definição obrigatória da primeira senha.
- `/dashboard`: resumo conectado ao backend.
- `/headcount`, `/turnover`, `/banco-de-horas` e `/absenteismo`: módulos preparados para os dashboards.
- `/importacoes`: envio, prévia, tratamento de problemas, confirmação, histórico e cancelamento seguro das bases de funcionários e ABS/BH.
- `/funcionarios`: consulta, busca, filtros, cadastro e correção manual dos funcionários.
- `/lancamentos`: disponível para gestor e analista.
- `/usuarios`: disponível somente para gestor.

O token de acesso fica em `sessionStorage`, portanto a sessão termina quando a aba é encerrada. Respostas `401` do backend removem a sessão automaticamente.

A preferência entre modo claro e escuro fica salva no navegador. Na primeira visita, o sistema respeita o tema do computador.
