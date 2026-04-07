import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <Skeleton className="h-[36svh] w-full rounded-2xl md:h-[48svh]" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
