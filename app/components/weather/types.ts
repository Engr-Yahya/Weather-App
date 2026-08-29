export type TemperatureUnit = "celsius" | "fahrenheit";

export type WeatherLocation = {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type WeatherData = {
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

export const DEFAULT_LOCATION: WeatherLocation = {
  name: "New York",
  country: "United States",
  admin1: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

export const WEATHER_CODES: Record<number, { label: string; daytime: string; nighttime: string }> = {
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
