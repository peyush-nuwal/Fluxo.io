import { SearchX } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export default function EmptyState({
  title = "Nothing here yet",
  description = "Once data is available, it will appear here.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-24 text-center">
      {/* Gradient glow */}
      <div className="absolute inset-0 -z-10 flex justify-center">
        <div className="h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
      </div>

      {/* Icon wrapper */}
      <div className="group mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-background/70 shadow-sm backdrop-blur transition hover:shadow-md">
        {icon ?? (
          <SearchX className="h-8 w-8 text-muted-foreground transition group-hover:scale-105" />
        )}
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
