import { useEffect, useState } from 'react';
import { searchLocations } from '../services/locationSearchApi';

const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

const INITIAL_SEARCH_STATE = {
  suggestions: [],
  status: 'idle',
  error: '',
};

export function useLocationSuggestions({
  query,
  inputValue,
  selectedLocation,
  enabled,
}) {
  const [searchState, setSearchState] = useState(INITIAL_SEARCH_STATE);

  useEffect(() => {
    const searchTerm = query.trim();
    if (
      !enabled
      || selectedLocation
      || searchTerm.length < MIN_QUERY_LENGTH
      || searchTerm !== inputValue.trim()
    ) {
      setSearchState(INITIAL_SEARCH_STATE);
      return undefined;
    }

    const controller = new AbortController();
    setSearchState({
      suggestions: [],
      status: 'loading',
      error: '',
    });

    const debounceTimer = setTimeout(async () => {
      try {
        const suggestions = await searchLocations(searchTerm, controller.signal);
        if (!controller.signal.aborted) {
          setSearchState({
            suggestions,
            status: 'success',
            error: '',
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearchState({
            suggestions: [],
            status: 'error',
            error: error instanceof Error
              ? error.message
              : 'Unable to search for locations.',
          });
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [enabled, inputValue, query, selectedLocation]);

  return searchState;
}
