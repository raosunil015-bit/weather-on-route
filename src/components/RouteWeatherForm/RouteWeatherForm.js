import { useState } from 'react';
import styles from './RouteWeatherForm.module.css';
import LocationAutocomplete from '../LocationAutocomplete/LocationAutocomplete';
import RouteWeatherTimeline from '../RouteWeatherTimeline/RouteWeatherTimeline';
import { useRouteWeather } from '../../hooks/useRouteWeather';

function RouteWeatherForm() {
  const [locations, setLocations] = useState({
    origin: { value: '', selected: null },
    destination: { value: '', selected: null },
  });
  const {
    error,
    isLoading,
    loadRouteWeather,
    routeWeather,
  } = useRouteWeather();

  const swapLocations = () => {
    setLocations(({ origin, destination }) => ({
      origin: destination,
      destination: origin,
    }));
  };

  const updateLocation = (name, value, selected = null) => {
    setLocations((currentLocations) => ({
      ...currentLocations,
      [name]: { value, selected },
    }));
  };

  const getRouteWeather = (event) => {
    event.preventDefault();
    loadRouteWeather({
      origin: locations.origin.value.trim(),
      destination: locations.destination.value.trim(),
    });
  };

  return (
    <main className={styles.appShell}>
      <section className={styles.routeCard} aria-label="Route weather search">
        <header className={styles.appHeader}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">➤</span>
            <span className={styles.brandName}>RouteCast</span>
          </div>
          <p className={styles.headerCaption}>Weather along your journey</p>
        </header>

        <form className={styles.routeForm} onSubmit={getRouteWeather}>
          <LocationAutocomplete
            name="origin"
            label="Origin"
            value={locations.origin.value}
            selectedLocation={locations.origin.selected}
            onChange={(value) => updateLocation('origin', value)}
            onSelect={(location) => updateLocation('origin', location.label, location)}
          />

          <button
            className={styles.swapButton}
            type="button"
            aria-label="Swap origin and destination"
            onClick={swapLocations}
          >
            ⇄
          </button>

          <LocationAutocomplete
            name="destination"
            label="Destination"
            value={locations.destination.value}
            selectedLocation={locations.destination.selected}
            onChange={(value) => updateLocation('destination', value)}
            onSelect={(location) => updateLocation('destination', location.label, location)}
          />

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Get route weather'}
          </button>
        </form>

        <div className={styles.routeSummary} aria-live="polite">
          <span className={styles.routeLine} aria-hidden="true" />
          <span>
            {locations.origin.value || 'Origin'}
            <span aria-hidden="true"> → </span>
            {locations.destination.value || 'Destination'}
          </span>
        </div>

        {error && (
          <p className={`${styles.feedback} ${styles.errorMessage}`} role="alert">
            {error}
          </p>
        )}
        {routeWeather !== null && (
          <RouteWeatherTimeline stops={routeWeather} />
        )}
      </section>
    </main>
  );
}

export default RouteWeatherForm;
