export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!latitude || !longitude) {
    return Response.json({ error: "Latitude and longitude are required." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": "weather-app/1.0",
    },
  });

  if (!response.ok) {
    return Response.json({ results: [] }, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const payload = (await response.json()) as {
    name?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      county?: string;
      country?: string;
      city_district?: string;
    };
  };

  const address = payload.address ?? {};
  const cityName =
    payload.name ??
    address.city ??
    address.town ??
    address.village ??
    address.city_district ??
    address.state ??
    address.county ??
    "Current location";

  const resolved = {
    results: [
      {
        name: cityName,
        country: address.country ?? "Local area",
        admin1: address.state ?? address.county,
        latitude: Number(latitude),
        longitude: Number(longitude),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? undefined,
      },
    ],
  };

  return Response.json(resolved, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
