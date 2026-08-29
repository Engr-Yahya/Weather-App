import { ArrowRight, Search } from "lucide-react";

import type { WeatherLocation } from "./types";

type LocationSearchProps = {
  query: string;
  searchResults: WeatherLocation[];
  locationError?: string;
  onQueryChange: (value: string) => void;
  onLocationSelect: (location: WeatherLocation) => void;
};

export function LocationSearch({
  query,
  searchResults,
  locationError,
  onQueryChange,
  onLocationSelect,
}: LocationSearchProps) {
  return (
    <section className="mt-6 mx-auto w-full max-w-[1400px]">
      <div className="relative">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search for a city or region"
          className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/75 pl-12 pr-4 text-base leading-relaxed text-slate-100 outline-none transition shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-slate-400 focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/25"
        />
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      </div>

      {query.trim() && searchResults.length > 0 && (
        <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {searchResults.map((result) => (
            <button
              key={`${result.name}-${result.latitude}-${result.longitude}`}
              type="button"
              onClick={() => onLocationSelect(result)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-800/80"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-100">{result.name}</div>
                <div className="truncate text-sm text-slate-400">
                  {result.admin1 ? `${result.admin1}, ` : ""}
                  {result.country}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {locationError ? <p className="mt-3 text-sm text-sky-300">{locationError}</p> : null}
    </section>
  );
}
