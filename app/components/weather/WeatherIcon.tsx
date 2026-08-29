import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  SunMedium,
  type LucideIcon,
} from "lucide-react";

import { WEATHER_CODES, type TemperatureUnit } from "./types";

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

export function convertTemperature(value: number, unit: TemperatureUnit) {
  return unit === "celsius" ? value : (value * 9) / 5 + 32;
}

export function formatTemperature(value: number, unit: TemperatureUnit) {
  const temperature = Math.round(convertTemperature(value, unit));
  return `${temperature}°${unit === "celsius" ? "C" : "F"}`;
}

export function getWeatherCondition(code: number, isDay: number) {
  const condition = WEATHER_CODES[code] ?? { label: "Unknown", daytime: "Unknown", nighttime: "Unknown" };
  return isDay ? condition.daytime : condition.nighttime;
}

export function formatHourLabel(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDayLabel(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function WeatherIcon({ code, size = 64 }: { code: number; size?: number }) {
  const Icon = WEATHER_ICONS[code] ?? Cloud;
  return <Icon size={size} strokeWidth={1.8} className="text-current" aria-label="Weather condition" />;
}
