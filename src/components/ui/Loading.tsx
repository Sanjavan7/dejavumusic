export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-muted/30 border-t-primary rounded-full animate-spin ${className}`}
    />
  );
}

export function SongCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border animate-pulse">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-surface-light flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-light rounded w-3/4" />
          <div className="h-3 bg-surface-light rounded w-1/2" />
          <div className="h-3 bg-surface-light rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-muted/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}
