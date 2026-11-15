import { PHOTON_SEARCH_URL } from '../config/api';

export async function searchLocations(query, signal) {
  const url = new URL(PHOTON_SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Location search failed (${response.status})`);
  }

  const result = await response.json();
  if (!result || !Array.isArray(result.features)) {
    throw new Error('Location search returned an invalid response.');
  }

  return result.features.reduce((locations, feature) => {
    const properties = feature && feature.properties;
    const coordinates = feature && feature.geometry && feature.geometry.coordinates;
    if (!properties || !Array.isArray(coordinates) || coordinates.length < 2) {
      return locations;
    }

    const label = [properties.name, properties.state, properties.country]
      .filter((part) => typeof part === 'string' && part.trim())
      .join(', ');
    const lon = coordinates[0];
    const lat = coordinates[1];

    if (label && Number.isFinite(lat) && Number.isFinite(lon)) {
      locations.push({ label, lat, lon });
    }

    return locations;
  }, []);
}
