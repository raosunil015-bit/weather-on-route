import { ROUTE_WEATHER_URL } from '../config/api';

export async function fetchRouteWeather({ origin, destination }) {
  const response = await fetch(ROUTE_WEATHER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination }),
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error('Expected the API response to be a list of objects.');
  }

  const stops = result.flat(Infinity);
  if (stops.some(
    (item) => item === null || typeof item !== 'object' || Array.isArray(item),
  )) {
    throw new Error('Expected the API response to be a list of objects.');
  }

  return stops;
}
