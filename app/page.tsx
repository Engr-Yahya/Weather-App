
"use client";

import {
  ArrowRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Gauge,
  LocateFixed,
  MapPin,
  Search,
  SunMedium,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type TemperatureUnit = "celsius" | "fahrenheit";

type WeatherLocation = {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

type WeatherData = {
  timezone: string;
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    surface_pressure: number;
    is_day: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
  };
};

const DEFAULT_LOCATION: WeatherLocation = {
  name: "New York",
  country: "United States",
  admin1: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

const WEATHER_CODES: Record<number, { label: string; daytime: string; nighttime: string }> = {
  0: { label: "Clear sky", daytime: "Clear", nighttime: "Clear" },
  1: { label: "Mostly clear", daytime: "Mostly clear", nighttime: "Mostly clear" },
  2: { label: "Partly cloudy", daytime: "Partly cloudy", nighttime: "Partly cloudy" },
  3: { label: "Overcast", daytime: "Overcast", nighttime: "Overcast" },
  45: { label: "Fog", daytime: "Fog", nighttime: "Fog" },
  48: { label: "Rime fog", daytime: "Rime fog", nighttime: "Rime fog" },
  51: { label: "Light drizzle", daytime: "Light drizzle", nighttime: "Light drizzle" },
  53: { label: "Drizzle", daytime: "Drizzle", nighttime: "Drizzle" },
  55: { label: "Heavy drizzle", daytime: "Heavy drizzle", nighttime: "Heavy drizzle" },
  56: { label: "Freezing drizzle", daytime: "Freezing drizzle", nighttime: "Freezing drizzle" },
  57: { label: "Heavy freezing drizzle", daytime: "Heavy freezing drizzle", nighttime: "Heavy freezing drizzle" },
  61: { label: "Light rain", daytime: "Light rain", nighttime: "Light rain" },
  63: { label: "Rain", daytime: "Rain", nighttime: "Rain" },
  65: { label: "Heavy rain", daytime: "Heavy rain", nighttime: "Heavy rain" },
  66: { label: "Freezing rain", daytime: "Freezing rain", nighttime: "Freezing rain" },
  67: { label: "Heavy freezing rain", daytime: "Heavy freezing rain", nighttime: "Heavy freezing rain" },
  71: { label: "Light snow", daytime: "Light snow", nighttime: "Light snow" },
  73: { label: "Snow", daytime: "Snow", nighttime: "Snow" },
  75: { label: "Heavy snow", daytime: "Heavy snow", nighttime: "Heavy snow" },
  77: { label: "Snow grains", daytime: "Snow grains", nighttime: "Snow grains" },
  80: { label: "Rain showers", daytime: "Rain showers", nighttime: "Rain showers" },
  81: { label: "Heavy rain showers", daytime: "Heavy rain showers", nighttime: "Heavy rain showers" },
  82: { label: "Violent rain showers", daytime: "Violent rain showers", nighttime: "Violent rain showers" },
  85: { label: "Snow showers", daytime: "Snow showers", nighttime: "Snow showers" },
  86: { label: "Heavy snow showers", daytime: "Heavy snow showers", nighttime: "Heavy snow showers" },
  95: { label: "Thunderstorm", daytime: "Thunderstorm", nighttime: "Thunderstorm" },
  96: { label: "Thunderstorm with hail", daytime: "Thunderstorm with hail", nighttime: "Thunderstorm with hail" },
  99: { label: "Heavy thunderstorm with hail", daytime: "Heavy thunderstorm with hail", nighttime: "Heavy thunderstorm with hail" },
};

function convertTemperature(value: number, unit: TemperatureUnit) {
  return unit === "celsius" ? value : (value * 9) / 5 + 32;
}

function formatTemperature(value: number, unit: TemperatureUnit) {
  const temperature = Math.round(convertTemperature(value, unit));
  return `${temperature}°${unit === "celsius" ? "C" : "F"}`;
}

function getWeatherCondition(code: number, isDay: number) {
  const condition = WEATHER_CODES[code] ?? { label: "Unknown", daytime: "Unknown", nighttime: "Unknown" };
  return isDay ? condition.daytime : condition.nighttime;
}

function formatHourLabel(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDayLabel(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

const WEATHER_ICONS: Record<number, LucideIcon> = {
  0: SunMedium,
  1: CloudSun,
  2: CloudSun,
  3: Cloud,
  45: CloudFog,
  48: CloudFog,
  51: CloudDrizzle,
  53: CloudDrizzle,
  55: CloudDrizzle,
  56: CloudDrizzle,
  57: CloudDrizzle,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  66: CloudRain,
  67: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: CloudSnow,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
};

function WeatherIcon({ code, size = 64 }: { code: number; size?: number }) {
  const Icon = WEATHER_ICONS[code] ?? Cloud;
  return <Icon size={size} strokeWidth={1.8} className="text-current" aria-label="Weather condition" />;
}

async function fetchWeatherForLocation(location: WeatherLocation) {
  const response = await axios.get<WeatherData>("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: location.latitude,
      longitude: location.longitude,
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure,is_day",
      hourly: "temperature_2m,precipitation_probability,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
      forecast_days: 7,
      timezone: "auto",
    },
  });

  return response.data;
}

async function searchLocations(searchText: string) {
  const query = searchText.trim();
  if (!query) {
    return [];
  }

  const response = await axios.get<{ results?: Array<Record<string, unknown>> }>(
    "https://geocoding-api.open-meteo.com/v1/search",
    {
      params: {
        name: query,
        count: 6,
        language: "en",
        format: "json",
      },
    }
  );

  const results = response.data.results ?? [];

  return results.map((item) => ({
    name: String(item.name ?? "Unknown"),
    country: String(item.country ?? "Unknown"),
    admin1: typeof item.admin1 === "string" ? item.admin1 : undefined,
    latitude: Number(item.latitude ?? 0),
    longitude: Number(item.longitude ?? 0),
    timezone: typeof item.timezone === "string" ? item.timezone : undefined,
  })) as WeatherLocation[];
}

async function resolveCurrentLocation(lat: number, lon: number) {
  const response = await axios.get<{ results?: Array<Record<string, unknown>> }>("/api/reverse-geocode", {
    params: {
      latitude: lat,
      longitude: lon,
    },
  });

  if (!response.data.results || response.data.results.length === 0) {
    return {
      name: "Current location",
      country: "Local area",
      admin1: undefined,
      latitude: lat,
      longitude: lon,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? undefined,
    } satisfies WeatherLocation;
  }

  const firstResult = response.data.results[0];

  return {
    name: String(firstResult?.name ?? "Current location"),
    country: String(firstResult?.country ?? "Local area"),
    admin1: typeof firstResult?.admin1 === "string" ? firstResult.admin1 : undefined,
    latitude: Number(firstResult?.latitude ?? lat),
    longitude: Number(firstResult?.longitude ?? lon),
    timezone: typeof firstResult?.timezone === "string" ? firstResult.timezone : undefined,
  } satisfies WeatherLocation;
}

export default function Home() {
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [isCurrentLocationActive, setIsCurrentLocationActive] = useState(false);
  const [lastNonCurrentLocation, setLastNonCurrentLocation] = useState<WeatherLocation | null>(DEFAULT_LOCATION);
  const [locationError, setLocationError] = useState("");
  const [hasShownInitialModal, setHasShownInitialModal] = useState(false);

  useEffect(() => {
    if (!selectedLocation) {
      setSelectedLocation(DEFAULT_LOCATION);
    }
  }, [selectedLocation]);

  const weatherQuery = useQuery({
    queryKey: ["weather", selectedLocation],
    enabled: !!selectedLocation,
    queryFn: () => fetchWeatherForLocation(selectedLocation!),
  });

  const weather = weatherQuery.data ?? null;
  const isLoading = weatherQuery.isLoading || weatherQuery.isFetching || isGeoLoading;

  useEffect(() => {
    if (weatherQuery.isSuccess && !hasShownInitialModal) {
      setIsLocationModalOpen(true);
      setHasShownInitialModal(true);
    }
  }, [weatherQuery.isSuccess, hasShownInitialModal]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const results = await searchLocations(query);
      setSearchResults(results);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  const hourlyForecast = useMemo(() => {
    if (!weather) {
      return [];
    }

    const currentTime = new Date(weather.current.time).getTime();
    const startIndex = weather.hourly.time.findIndex((time) => new Date(time).getTime() >= currentTime);
    const safeStartIndex = startIndex >= 0 ? startIndex : 0;

    return weather.hourly.time.slice(safeStartIndex, safeStartIndex + 8).map((time, offset) => ({
      time,
      temp: weather.hourly.temperature_2m[safeStartIndex + offset],
      precipitation: weather.hourly.precipitation_probability[safeStartIndex + offset],
      code: weather.hourly.weather_code[safeStartIndex + offset],
    }));
  }, [weather]);

  const dailyForecast = useMemo(() => {
    if (!weather) {
      return [];
    }

    return weather.daily.time.slice(0, 5).map((time, index) => ({
      time,
      high: weather.daily.temperature_2m_max[index],
      low: weather.daily.temperature_2m_min[index],
      rainChance: weather.daily.precipitation_probability_max[index],
      code: weather.daily.weather_code[index],
    }));
  }, [weather]);

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support geolocation.");
      setIsLocationModalOpen(false);
      return;
    }

    setIsLocationModalOpen(false);
    setIsGeoLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const nextLocation = await resolveCurrentLocation(lat, lon);

          setSelectedLocation(nextLocation);
          setQuery(nextLocation.name);
          setLastNonCurrentLocation(nextLocation);
          setLocationError("");
          setIsCurrentLocationActive(true);
        } catch {
          setLocationError("We could not resolve your city name, but your weather is still available.");
          setIsCurrentLocationActive(false);
        } finally {
          setIsGeoLoading(false);
        }
      },
      () => {
        setLocationError("Location access was denied. Please search for a city manually.");
        setIsCurrentLocationActive(false);
        setIsGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (!weather || isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a,_#0f172a_45%,_#020617)] px-4 py-6 text-slate-50">
        <div className="mx-auto max-w-5xl animate-pulse rounded-[30px] border border-slate-700/70 bg-slate-900/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl">
          <div className="h-8 w-32 rounded-full bg-slate-700/80" />
          <div className="mt-10 h-16 w-full rounded-2xl bg-slate-700/80" />
          <div className="mt-8 grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
            <div className="h-80 rounded-3xl bg-slate-700/80" />
            <div className="h-80 rounded-3xl bg-slate-700/80" />
          </div>
        </div>
      </main>
    );
  }

  const currentCode = weather.current.weather_code;
  const currentCondition = getWeatherCondition(currentCode, weather.current.is_day);
  const currentLocationLabel = selectedLocation
    ? [selectedLocation.name, selectedLocation.admin1, selectedLocation.country].filter(Boolean).join(", ")
    : "Location";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a,_#0f172a_45%,_#020617)] px-4 py-6 text-slate-50">
      <div className="mx-auto max-w-[1400px] rounded-[32px] border border-slate-700/70 bg-slate-900/70 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:p-4 md:p-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sky-300 sm:text-xs">Weather</p>
            <h1 className="mt-2 text-2xl font-semibold leading-[1.1] text-white sm:text-[2rem] md:text-3xl">Global forecast</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex rounded-full border border-slate-700 bg-slate-800 p-1">
              {(["celsius", "fahrenheit"] as TemperatureUnit[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUnit(option)}
                  className={`flex h-9 min-w-[52px] items-center justify-center rounded-full px-3 text-sm font-medium transition sm:h-10 sm:min-w-20 sm:px-4 ${
                    unit === option
                      ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30"
                      : "text-slate-300 hover:bg-slate-700/70"
                  }`}
                >
                  {option === "celsius" ? "°C" : "°F"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isCurrentLocationActive) {
                  setIsCurrentLocationActive(false);
                  const fallback = lastNonCurrentLocation ?? DEFAULT_LOCATION;
                  setSelectedLocation(fallback);
                  setQuery(fallback.name);
                  setLocationError("");
                  return;
                }

                setIsLocationModalOpen(true);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm ${
                isCurrentLocationActive
                  ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                  : "border-slate-700 bg-slate-800 text-slate-100 hover:border-sky-400/60 hover:text-sky-200"
              }`}
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              <span>Use current location</span>
            </button>
          </div>
        </header>

        <section className="mt-6">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a city or region"
              className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-12 pr-4 text-base leading-relaxed text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
            />
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          </div>

          {query.trim() && searchResults.length > 0 && (
            <div className="mt-3 space-y-2 rounded-2xl border border-slate-700 bg-slate-900/90 p-2">
              {searchResults.map((result) => (
                <button
                  key={`${result.name}-${result.latitude}-${result.longitude}`}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(result);
                    setQuery(result.name);
                    setSearchResults([]);
                    setLastNonCurrentLocation(result);
                    setIsCurrentLocationActive(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-800"
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
          {locationError ? <p className="mt-3 text-sm text-rose-300">{locationError}</p> : null}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="relative flex flex-col justify-center min-w-0 rounded-[28px] border border-slate-700 bg-slate-950/60 p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400 sm:text-sm">Now</p>
                <h2 className="mt-2 break-words text-2xl font-semibold leading-[1.08] text-white sm:text-3xl md:text-4xl">{currentLocationLabel}</h2>
              </div>
              <div className="absolute right-4 top-4 min-w-[120px] rounded-2xl border border-sky-500/40 bg-sky-500/10 px-2 py-2 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-sky-200 sm:right-6 sm:top-6 sm:min-w-[140px] sm:text-[10px]">
                {weather.timezone}
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] border border-slate-700 bg-slate-800/70 text-sky-200 sm:h-[88px] sm:w-[88px]">
                  <WeatherIcon code={currentCode} size={56} />
                </div>
                <div className="min-w-0">
                  <div className="text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl md:text-6xl">{formatTemperature(weather.current.temperature_2m, unit)}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">{currentCondition}</div>
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 md:min-w-[350px] md:max-w-[380px] md:flex-1">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs">Feels like</div>
                  <div className="mt-2 text-base font-medium leading-tight text-white sm:text-lg">{formatTemperature(weather.current.apparent_temperature, unit)}</div>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs">Humidity</div>
                  <div className="mt-2 text-base font-medium leading-tight text-white sm:text-lg">{weather.current.relative_humidity_2m}%</div>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 sm:text-xs">Wind</div>
                  <div className="mt-2 text-base font-medium leading-tight text-white sm:text-lg">{Math.round(weather.current.wind_speed_10m)} km/h</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-700/80 pt-5 sm:grid-cols-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-400">High</span>
                <span className="text-base font-medium text-white">{formatTemperature(Math.max(...weather.daily.temperature_2m_max), unit)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-400">Low</span>
                <span className="text-base font-medium text-white">{formatTemperature(Math.min(...weather.daily.temperature_2m_min), unit)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-400">Precip.</span>
                <span className="text-base font-medium text-white">{weather.current.precipitation} mm</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[28px] border border-slate-700 bg-slate-950/60 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Forecast</p>
            <div className="mt-4 space-y-3">
              {dailyForecast.map((entry) => (
                <div key={entry.time} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                  <div className="w-12 shrink-0 text-sm font-medium text-slate-200">{formatDayLabel(entry.time).split(",")[0]}</div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-sky-200">
                    <WeatherIcon code={entry.code} size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-slate-300">{getWeatherCondition(entry.code, 1)}</div>
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

        <section className="mt-8 rounded-[28px] border border-slate-700 bg-slate-950/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hourly</p>
            <p className="text-sm text-slate-400">Next 8 hours</p>
          </div>

          <div className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-3">
              {hourlyForecast.map((entry) => (
                <div
                  key={entry.time}
                  className="w-[150px] shrink-0 rounded-2xl border border-slate-700 bg-slate-900/85 p-3 text-center"
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

      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <div className="w-[92vw] max-w-[500px] rounded-[30px] border border-slate-700 bg-slate-900 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.8)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
              <MapPin className="h-8 w-8" aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold leading-[1.1] text-white">Use your location</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Allow location access for a local forecast, or search for any city around the world manually.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className={`flex-1 rounded-2xl px-4 py-3 text-[14px] font-medium transition ${
                  isCurrentLocationActive
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "bg-sky-500 text-slate-950 hover:bg-sky-400"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  current location
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-[14px] font-medium text-slate-100 transition hover:border-slate-500"
              >
                Search manually
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
