import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-10 w-36" />
    </div>
  );
}
