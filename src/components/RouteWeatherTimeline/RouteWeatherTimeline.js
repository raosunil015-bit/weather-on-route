import { useMemo } from 'react';
import styles from './RouteWeatherTimeline.module.css';

function RouteWeatherTimeline({ stops }) {
  const orderedStops = useMemo(
    () => stops
      .map((stop, index) => {
        const sequence = Number(stop.Seq);
        return {
          stop,
          sequence: Number.isFinite(sequence) ? sequence : index + 1,
        };
      })
      .sort((first, second) => first.sequence - second.sequence),
    [stops],
  );

  if (orderedStops.length === 0) {
    return (
      <section className={styles.weatherResult} aria-label="Route weather timeline">
        <h2 className={styles.heading}>Route weather timeline</h2>
        <p className={styles.emptyResults}>No route weather results.</p>
      </section>
    );
  }

  return (
    <section className={styles.weatherResult} aria-label="Route weather timeline">
      <h2 className={styles.heading}>Route weather timeline</h2>
      <ol className={styles.timeline} aria-label="Stops in route sequence">
      {orderedStops.map(({ stop, sequence }, index) => {
        const weather = stop.weather && typeof stop.weather === 'object'
          ? stop.weather
          : {};
        let role = 'Waypoint';
        if (index === 0) {
          role = 'Origin';
        } else if (index === orderedStops.length - 1) {
          role = 'Destination';
        }

        return (
          <li className={styles.stop} key={`${sequence}-${index}`}>
            <div className={styles.rail} aria-hidden="true">
              <span className={styles.marker}>{sequence}</span>
              {index < orderedStops.length - 1 && <span className={styles.connector} />}
            </div>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.locationGroup}>
                  <h3 className={styles.location}>{stop.Location || 'Unknown location'}</h3>
                  <span className={styles.sequence}>#{sequence}</span>
                </div>
                {stop.Time && (
                  <span className={styles.time}>
                    {stop.Time}<span className={styles.role}> · {role}</span>
                  </span>
                )}
              </div>
              <div className={styles.weather}>
                {weather.Weather && <span className={styles.condition}>{weather.Weather}</span>}
                {weather.wind && <span className={styles.wind}>↗ {weather.wind}</span>}
                {weather.FeelsLike !== undefined && weather.FeelsLike !== null && (
                  <span className={styles.feelsLike}>
                    Feels like <strong>{weather.FeelsLike}°F</strong>
                  </span>
                )}
              </div>
            </article>
          </li>
        );
      })}
      </ol>
    </section>
  );
}

export default RouteWeatherTimeline;
