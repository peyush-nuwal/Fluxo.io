import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = () => {
  return (
    <div className="rounded-lg p-4 w-full max-w-[320px] shadow bg-card border border-border">
      {/* Thumbnail */}
      <Skeleton className="h-36 w-full rounded-md" />

      {/* Content */}
      <div className="flex mt-5 gap-3">
        {/* Avatar */}
        <Skeleton className="size-8 rounded-full" />

        {/* Text */}
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-40" /> {/* title */}
          <Skeleton className="h-3 w-28" /> {/* meta */}
        </div>

        {/* Menu button */}
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </div>
    </div>
  );
};

export default CardSkeleton;
