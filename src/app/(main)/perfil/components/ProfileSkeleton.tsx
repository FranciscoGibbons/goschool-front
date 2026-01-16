export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Profile Card Skeleton */}
      <div className="h-48 bg-muted rounded-xl"></div>
      
      {/* Information Cards Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl md:col-span-2"></div>
      </div>
    </div>
  );
}
