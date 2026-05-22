import { Skeleton } from "@/components/ui/skeleton";

export default function StudyLoading() {
  return (
    <div className="flex flex-col items-center space-y-6 pt-8">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-2 w-full max-w-md rounded-full" />
      <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
