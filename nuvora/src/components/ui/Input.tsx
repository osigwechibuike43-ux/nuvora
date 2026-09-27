import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-nuvora-white">
          {label} {required && <span className="text-nuvora-green">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "h-11 rounded-xl border border-nuvora-border bg-nuvora-card px-4 text-sm text-nuvora-white",
            "placeholder:text-nuvora-muted transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-nuvora-green focus:border-nuvora-green",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-nuvora-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
