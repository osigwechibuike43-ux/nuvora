import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** A calm, honest error message — never a raw stack trace or technical string. */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl border border-nuvora-border bg-nuvora-card p-8 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-nuvora-green" aria-hidden />
      <p className="font-display text-lg font-medium">{title}</p>
      <p className="max-w-sm text-sm text-nuvora-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-nuvora-border p-10 text-center">
      {icon}
      <p className="font-display text-lg font-medium">{title}</p>
      <p className="max-w-sm text-sm text-nuvora-muted">{message}</p>
      {action}
    </div>
  );
}
