import { LocateFixed, MapPin } from "lucide-react";

type LocationModalProps = {
  isOpen: boolean;
  isCurrentLocationActive: boolean;
  onUseCurrentLocation: () => void;
  onClose: () => void;
};

export function LocationModal({
  isOpen,
  isCurrentLocationActive,
  onUseCurrentLocation,
  onClose,
}: LocationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
      <div className="w-[92vw] max-w-[500px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.82))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.8)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 shadow-[0_10px_30px_rgba(56,189,248,0.2)]">
          <MapPin className="h-8 w-8" aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold leading-[1.1] text-white">Use your location</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Allow location access for a local forecast, or search for any city around the world manually.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className={`flex-1 rounded-2xl px-4 py-3 text-[14px] font-medium transition ${
              isCurrentLocationActive
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                : "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 hover:brightness-110"
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              current location
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-[14px] font-medium text-slate-100 transition hover:border-sky-400/40 hover:text-sky-200"
          >
            Search manually
          </button>
        </div>
      </div>
    </div>
  );
}
