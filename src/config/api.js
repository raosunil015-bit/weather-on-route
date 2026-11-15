const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

export const ROUTE_WEATHER_URL = `${API_BASE_URL}/getWetherRoute`;
export const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/';
