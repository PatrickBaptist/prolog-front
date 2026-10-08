export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-black tracking-tight text-white shadow-lg shadow-blue-950/20">
        RH
      </div>
      {!compact ? (
        <div>
          <p className="text-base font-bold tracking-tight">Prolog RH</p>
          <p className="text-xs text-slate-400">Indicadores de pessoas</p>
        </div>
      ) : null}
    </div>
  );
}
