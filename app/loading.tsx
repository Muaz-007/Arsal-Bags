import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="container py-12 space-y-10">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="aspect-square rounded-2xl" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
