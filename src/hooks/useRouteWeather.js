import { useCallback, useRef, useState } from 'react';
import { fetchRouteWeather } from '../services/routeWeatherApi';

const INITIAL_STATE = {
  data: null,
  error: '',
  status: 'idle',
};

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unable to load route weather.';
}

export function useRouteWeather() {
  const [state, setState] = useState(INITIAL_STATE);
  const requestInFlight = useRef(false);

  const loadRouteWeather = useCallback(async (route) => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setState({
      data: null,
      error: '',
      status: 'loading',
    });

    try {
      const data = await fetchRouteWeather(route);
      setState({
        data,
        error: '',
        status: 'success',
      });
    } catch (error) {
      setState({
        data: null,
        error: getErrorMessage(error),
        status: 'error',
      });
    } finally {
      requestInFlight.current = false;
    }
  }, []);

  return {
    error: state.error,
    isLoading: state.status === 'loading',
    loadRouteWeather,
    routeWeather: state.data,
  };
}
