import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  const ids = Array.from({ length: count }, (_, i) => `skeleton-${i}`);
  return (
    <div
      data-ocid="shared.loading_state"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6"
    >
      {ids.map((id) => (
        <div
          key={id}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  title = "Ceva nu a mers bine",
  description = "Nu am putut încărca datele. Verifică conexiunea și încearcă din nou.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      data-ocid="shared.error_state"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <h2 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button
          type="button"
          data-ocid="shared.retry_button"
          onClick={onRetry}
          className="mt-4 rounded-full"
        >
          Încearcă din nou
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-ocid="shared.empty_state"
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-4 grid size-14 place-items-center rounded-full bg-secondary text-primary">
          {icon}
        </span>
      )}
      <h2 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
