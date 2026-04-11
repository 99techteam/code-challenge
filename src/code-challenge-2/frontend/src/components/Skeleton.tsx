export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function CampaignCardSkeleton() {
  return (
    <div className="campaign-card skeleton-card">
      <Skeleton className="sk-title" />
      <Skeleton className="sk-sub" />
      <Skeleton className="sk-badge" />
    </div>
  );
}
