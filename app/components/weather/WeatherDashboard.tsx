import { LocateFixed } from "lucide-react";

import { formatDayLabel, formatHourLabel, formatTemperature, getWeatherCondition, WeatherIcon } from "./WeatherIcon";
import type { TemperatureUnit, WeatherData, WeatherLocation } from "./types";

type WeatherDashboardProps = {
  unit: TemperatureUnit;
  selectedLocation: WeatherLocation | null;
  weather: WeatherData;
  hourlyForecast: { time: string; temp: number; precipitation: number; code: number }[];
  dailyForecast: { time: string; high: number; low: number; rainChance: number; code: number }[];
  isCurrentLocationActive: boolean;
  onUnitChange: (unit: TemperatureUnit) => void;
  onLocationToggle: () => void;
};

export function WeatherDashboard({
  unit,
  selectedLocation,
  weather,
  hourlyForecast,
  dailyForecast,
  isCurrentLocationActive,
  onUnitChange,
  onLocationToggle,
}: WeatherDashboardProps) {
  const currentCode = weather.current.weather_code;
  const currentCondition = getWeatherCondition(currentCode, weather.current.is_day);
  const currentLocationLabel = selectedLocation
    ? [selectedLocation.name, selectedLocation.admin1, selectedLocation.country].filter(Boolean).join(", ")
    : "Location";

  return (
    <div className="relative mx-auto mt-8 max-w-[1400px] overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/65 p-3 shadow-[0_35px_120px_rgba(2,6,23,0.75)] ring-1 ring-sky-400/10 backdrop-blur-2xl sm:p-4 md:p-6">
      <div className="pointer-events-none absolute -left-10 top-8 h-52 w-52 rounded-full bg-sky-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-sky-300 sm:text-xs">Weather</p>
            <h1 className="mt-2 text-2xl font-semibold leading-[1.1] text-white sm:text-[2rem] md:text-3xl">Global forecast</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex rounded-full border border-white/10 bg-slate-900/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {(["celsius", "fahrenheit"] as TemperatureUnit[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUnitChange(option)}
                  className={`flex h-9 min-w-[52px] items-center justify-center rounded-full px-3 text-sm font-medium transition sm:h-10 sm:min-w-20 sm:px-4 ${
                    unit === option
                      ? "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-[0_12px_35px_rgba(56,189,248,0.4)]"
                      : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
                  }`}
                >
                  {option === "celsius" ? "°C" : "°F"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onLocationToggle}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm ${
                isCurrentLocationActive
                  ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                  : "border-white/10 bg-slate-900/70 text-slate-100 hover:border-sky-400/60 hover:text-sky-200"
              }`}
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              <span>Use current location</span>
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="relative min-w-0 rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(15,23,42,0.62))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5 md:p-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-400/8 to-transparent" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400 sm:text-sm">Now</p>
                <h2 className="mt-2 break-words text-2xl font-semibold leading-[1.08] text-white sm:text-3xl md:text-4xl">{currentLocationLabel}</h2>
              </div>
              <div className="absolute right-4 top-4 min-w-[120px] rounded-2xl border border-sky-400/30 bg-sky-500/10 px-2 py-2 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-sky-200 sm:right-6 sm:top-6 sm:min-w-[140px] sm:text-[10px]">
                {weather.timezone}
              </div>
            </div>

            <div className="relative mt-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] border border-sky-400/20 bg-gradient-to-br from-sky-500/15 to-cyan-500/5 text-sky-200 shadow-[0_15px_30px_rgba(14,165,233,0.18)] sm:h-[88px] sm:w-[88px]">
                  <WeatherIcon code={currentCode} size={56} />
                </div>
                <div className="min-w-0">
                  <div className="text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl md:text-6xl">{formatTemperature(weather.current.temperature_2m, unit)}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">{currentCondition}</div>
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 md:min-w-[350px] md:max-w-[380px] md:flex-1">
                <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs">Feels like</div>
                  <div className="mt-2 text-base font-medium leading-tight text-white sm:text-lg">{formatTemperature(weather.current.apparent_temperature, unit)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs">Humidity</div>
                  <div className="mt-2 text-base font-medium leading-tight text-white sm:text-lg">{weather.current.relative_humidity_2m}%</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs">Wind</div>
                  <div className="mt-2 text-base font-medium leading-tight text-white sm:text-lg">{Math.round(weather.current.wind_speed_10m)} km/h</div>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-400">High</span>
                <span className="text-base font-medium text-white">{formatTemperature(Math.max(...weather.daily.temperature_2m_max), unit)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-400">Low</span>
                <span className="text-base font-medium text-white">{formatTemperature(Math.min(...weather.daily.temperature_2m_min), unit)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-400">Precip.</span>
                <span className="text-base font-medium text-white">{weather.current.precipitation} mm</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Forecast</p>
            <div className="mt-4 space-y-3">
              {dailyForecast.map((entry) => (
                <div key={entry.time} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-3 transition hover:border-sky-400/30 hover:bg-slate-900/90">
                  <div className="w-12 shrink-0 text-sm font-medium text-slate-200">{formatDayLabel(entry.time).split(",")[0]}</div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-slate-800/80 p-1.5 text-sky-200">
                    <WeatherIcon code={entry.code} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-200">{getWeatherCondition(entry.code, 1)}</div>
                    <div className="text-xs text-slate-400">{entry.rainChance}% rain</div>
                  </div>
                  <div className="text-right text-sm font-medium text-white">
                    <div>{formatTemperature(entry.high, unit)}</div>
                    <div className="text-slate-400">{formatTemperature(entry.low, unit)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(15,23,42,0.6))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hourly</p>
            <p className="text-sm text-slate-400">Next 8 hours</p>
          </div>

          <div className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-3">
              {hourlyForecast.map((entry) => (
                <div
                  key={entry.time}
                  className="w-[150px] shrink-0 rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="text-sm leading-relaxed text-slate-300">{formatHourLabel(entry.time)}</div>
                  <div className="mt-3 flex justify-center text-sky-200">
                    <WeatherIcon code={entry.code} size={34} />
                  </div>
                  <div className="mt-3 text-lg font-semibold leading-tight text-white">{formatTemperature(entry.temp, unit)}</div>
                  <div className="mt-2 text-xs leading-relaxed text-slate-400">{entry.precipitation}% rain</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
