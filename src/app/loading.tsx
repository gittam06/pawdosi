import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-page px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-6 w-56 rounded-full" />
        <Skeleton className="h-12 w-full max-w-2xl rounded-2xl" />
        <Skeleton className="h-12 w-3/4 max-w-xl rounded-2xl" />
        <Skeleton className="mt-4 h-11 w-48 rounded-lg" />
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}
