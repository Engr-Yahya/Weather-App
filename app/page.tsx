
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import { LocationModal } from "./components/weather/LocationModal";
import { LocationSearch } from "./components/weather/LocationSearch";
import { WeatherDashboard } from "./components/weather/WeatherDashboard";
import { DEFAULT_LOCATION, type TemperatureUnit, type WeatherData, type WeatherLocation } from "./components/weather/types";

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
  const buildFallbackLocation = (name = "Current location"): WeatherLocation => ({
    name,
    country: "Local area",
    admin1: undefined,
    latitude: lat,
    longitude: lon,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? undefined,
  });

  try {
    const response = await axios.get<{ results?: Array<Record<string, unknown>> }>(
      "https://geocoding-api.open-meteo.com/v1/reverse",
      {
        params: {
          latitude: lat,
          longitude: lon,
          language: "en",
          format: "json",
        },
      }
    );

    const firstResult = response.data.results?.[0];

    if (firstResult) {
      return {
        name: String(firstResult?.name ?? "Current location"),
        country: String(firstResult?.country ?? "Local area"),
        admin1: typeof firstResult?.admin1 === "string" ? firstResult.admin1 : undefined,
        latitude: Number(firstResult?.latitude ?? lat),
        longitude: Number(firstResult?.longitude ?? lon),
        timezone: typeof firstResult?.timezone === "string" ? firstResult.timezone : undefined,
      } satisfies WeatherLocation;
    }
  } catch {
    // Fall through to local server fallback below.
  }

  try {
    const response = await axios.get<{ results?: Array<Record<string, unknown>> }>("/api/reverse-geocode", {
      params: {
        latitude: lat,
        longitude: lon,
      },
    });

    const firstResult = response.data.results?.[0];

    if (firstResult) {
      return {
        name: String(firstResult?.name ?? "Current location"),
        country: String(firstResult?.country ?? "Local area"),
        admin1: typeof firstResult?.admin1 === "string" ? firstResult.admin1 : undefined,
        latitude: Number(firstResult?.latitude ?? lat),
        longitude: Number(firstResult?.longitude ?? lon),
        timezone: typeof firstResult?.timezone === "string" ? firstResult.timezone : undefined,
      } satisfies WeatherLocation;
    }
  } catch {
    // If both lookups fail, still return a usable local fallback.
  }

  return buildFallbackLocation();
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

  function handleLocationSelect(location: WeatherLocation) {
    setSelectedLocation(location);
    setQuery(location.name);
    setSearchResults([]);
    setLastNonCurrentLocation(location);
    setIsCurrentLocationActive(false);
  }

  function handleLocationToggle() {
    if (isCurrentLocationActive) {
      setIsCurrentLocationActive(false);
      const fallback = lastNonCurrentLocation ?? DEFAULT_LOCATION;
      setSelectedLocation(fallback);
      setQuery(fallback.name);
      setLocationError("");
      return;
    }

    setIsLocationModalOpen(true);
  }

  if (!weather || isLoading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_22%),radial-gradient(circle_at_right,_rgba(168,85,247,0.12),_transparent_24%),linear-gradient(135deg,_#020817_0%,_#0b1224_38%,_#0f172a_100%)] px-4 py-6 text-slate-50">
        <div className="relative mx-auto max-w-5xl animate-pulse overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/65 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.7)] backdrop-blur-2xl">
          <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -right-8 bottom-10 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative">
            <div className="h-8 w-32 rounded-full bg-slate-700/80" />
            <div className="mt-10 h-16 w-full rounded-2xl bg-slate-700/80" />
            <div className="mt-8 grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
              <div className="h-80 rounded-3xl bg-slate-700/80" />
              <div className="h-80 rounded-3xl bg-slate-700/80" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_20%),radial-gradient(circle_at_right,_rgba(168,85,247,0.14),_transparent_26%),linear-gradient(135deg,_#020817_0%,_#071527_30%,_#0f172a_100%)] px-4 py-6 text-slate-50 sm:px-6 lg:px-8">
      <LocationSearch
        query={query}
        searchResults={searchResults}
        locationError={locationError}
        onQueryChange={setQuery}
        onLocationSelect={handleLocationSelect}
      />

      <WeatherDashboard
        unit={unit}
        selectedLocation={selectedLocation}
        weather={weather}
        hourlyForecast={hourlyForecast}
        dailyForecast={dailyForecast}
        isCurrentLocationActive={isCurrentLocationActive}
        onUnitChange={setUnit}
        onLocationToggle={handleLocationToggle}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        isCurrentLocationActive={isCurrentLocationActive}
        onUseCurrentLocation={handleUseCurrentLocation}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </main>
  );
}
