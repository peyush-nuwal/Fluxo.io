import { Clock3, Hammer, TriangleAlert, Wrench } from "lucide-react";

const tickerItems = Array.from({ length: 8 });

const UnderConstruction = () => {
  return (
    <section className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_18%,#facc1530,transparent_45%),radial-gradient(circle_at_78%_10%,#fb718530,transparent_42%),linear-gradient(to_bottom,#0a0a0a08,transparent_45%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          Work in progress
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-yellow-600 sm:text-5xl md:text-6xl">
          UNDER CONSTRUCTION
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          We are actively building this section to deliver a cleaner experience,
          better performance, and more useful features.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-45 left-1/2 hidden w-[170%] -translate-x-1/2 -rotate-12 overflow-hidden bg-yellow-500 py-2 shadow-md md:block">
        <div className="flex items-center gap-12 whitespace-nowrap px-8 text-sm font-semibold uppercase tracking-wide text-black">
          {tickerItems.map((_, i) => (
            <span key={`strip-a-${i}`} className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Work In Progress
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-40 left-1/2 hidden w-[170%] -translate-x-1/2 rotate-12 overflow-hidden bg-yellow-500 py-2 shadow-md md:block">
        <div className="flex items-center gap-12 whitespace-nowrap px-8 text-sm font-semibold uppercase tracking-wide text-black">
          {tickerItems.map((_, i) => (
            <span key={`strip-b-${i}`} className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Work In Progress
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UnderConstruction;
