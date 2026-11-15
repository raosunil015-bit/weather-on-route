import { useState } from 'react';
import { useLocationSuggestions } from '../../hooks/useLocationSuggestions';
import styles from './LocationAutocomplete.module.css';

function LocationAutocomplete({
  name,
  label,
  value,
  selectedLocation,
  onChange,
  onSelect,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchEnabled = isOpen
    && !selectedLocation
    && query.trim().length >= 3
    && query.trim() === value.trim();
  const { suggestions, status, error: searchError } = useLocationSuggestions({
    query,
    inputValue: value,
    selectedLocation,
    enabled: searchEnabled,
  });
  const listId = `${name}-location-suggestions`;

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    setQuery(nextValue);
    setIsOpen(nextValue.trim().length >= 3);
    setActiveIndex(-1);
  };

  const handleSelect = (location) => {
    onSelect(location);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!searchEnabled || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(suggestions[activeIndex]);
    }
  };

  return (
    <div className={styles.locationAutocomplete}>
      <label className={styles.locationField}>
        <span
          className={`${styles.fieldIcon} ${
            name === 'origin' ? styles.originIcon : styles.destinationIcon
          }`}
          aria-hidden="true"
        >
          {name === 'origin' ? '○' : '⌖'}
        </span>
        <span className={styles.srOnly}>{label}</span>
        <input
          id={`${name}-location`}
          aria-label={label}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={searchEnabled}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          placeholder={label}
          required
          role="combobox"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </label>

      {searchEnabled && (
        <ul
          id={listId}
          className={`${styles.suggestions} absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl`}
          role="listbox"
          aria-label={`${label} suggestions`}
          aria-busy={status === 'loading'}
        >
          {status === 'loading' && (
            <li
              className={`${styles.suggestionMessage} px-4 py-3 text-sm text-slate-500`}
              role="presentation"
            >
              <span role="status">Searching locations…</span>
            </li>
          )}
          {status === 'error' && (
            <li
              className={`${styles.suggestionMessage} ${styles.suggestionError} px-4 py-3 text-sm text-rose-600`}
              role="presentation"
            >
              <span role="alert">{searchError}</span>
            </li>
          )}
          {status === 'success' && suggestions.length === 0 && (
            <li
              className={`${styles.suggestionMessage} px-4 py-3 text-sm text-slate-500`}
              role="presentation"
            >
              No locations found.
            </li>
          )}
          {status === 'success' && suggestions.map((suggestion, index) => (
            <li
              id={`${listId}-option-${index}`}
              className={`${styles.suggestionOption} w-full px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none`}
              key={`${suggestion.lat}-${suggestion.lon}-${suggestion.label}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationAutocomplete;
