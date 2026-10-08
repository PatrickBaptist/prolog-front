import { forwardRef, type InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, id, className = '', ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor={inputId}>
      {label}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`min-h-11 w-full min-w-0 rounded-xl border bg-white px-3.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-sky-950 ${error ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'} ${className}`}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-xs font-normal text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  );
});
