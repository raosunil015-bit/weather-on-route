import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('submits the origin and destination to the route weather API', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [
      [{
        Seq: 2,
        Location: 'Chicago, Illinois, United States',
        Time: '7:30 PM',
        weather: { wind: '10 mph NE', FeelsLike: 38, Weather: 'Rainy' },
      }],
      [{
        Seq: 1,
        Location: 'Charlotte, North Carolina, United States',
        Time: '4:30 PM',
        weather: { wind: '8 mph NE', FeelsLike: 38, Weather: 'Sunny' },
      }],
      [],
      [],
    ],
  });
  render(<App />);

  fireEvent.change(screen.getByRole('combobox', { name: /origin/i }), {
    target: { value: 'Austin, TX' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: /destination/i }), {
    target: { value: 'Houston, TX' },
  });
  fireEvent.click(screen.getByRole('button', { name: /get route weather/i }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost:8080/getWetherRoute',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Austin, TX', destination: 'Houston, TX' }),
    },
  ));
  expect(await screen.findByText(/Sunny/)).toBeInTheDocument();
  const timeline = screen.getByRole('list', { name: /stops in route sequence/i });
  expect(timeline.textContent.indexOf('Charlotte')).toBeLessThan(
    timeline.textContent.indexOf('Chicago'),
  );
  expect(timeline).toHaveTextContent('4:30 PM · Origin');
  expect(timeline).toHaveTextContent('7:30 PM · Destination');
});

test('rejects a response that is not a list of objects', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ forecast: 'Sunny' }),
  });
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /get route weather/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Expected the API response to be a list of objects.',
  );
});

test('swaps the origin and destination', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /swap origin and destination/i }));

  expect(screen.getByRole('combobox', { name: /origin/i })).toHaveValue('destination');
  expect(screen.getByRole('combobox', { name: /destination/i })).toHaveValue('origin');
  const routeSummary = screen
    .getByLabelText('Route weather search')
    .querySelector('[aria-live="polite"]');
  expect(routeSummary).toHaveTextContent('destination → origin');
});

test('shows an error when the API request fails', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    status: 500,
  });
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /get route weather/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Request failed (500)');
});

test('debounces Photon search and selects a formatted location suggestion', async () => {
  jest.useFakeTimers();
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      features: [{
        properties: { name: 'Springfield', state: undefined, country: 'United States' },
        geometry: { coordinates: [-93.2923, 37.2089] },
      }],
    }),
  });
  render(<App />);

  const originInput = screen.getByRole('combobox', { name: /origin/i });
  fireEvent.change(originInput, { target: { value: 'New' } });
  fireEvent.change(originInput, { target: { value: 'New York' } });
  expect(fetchMock).not.toHaveBeenCalled();

  act(() => jest.advanceTimersByTime(299));
  expect(fetchMock).not.toHaveBeenCalled();
  await act(async () => {
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const requestUrl = new URL(fetchMock.mock.calls[0][0]);
  expect(requestUrl.origin + requestUrl.pathname).toBe('https://photon.komoot.io/api/');
  expect(requestUrl.searchParams.get('q')).toBe('New York');
  expect(requestUrl.searchParams.get('limit')).toBe('5');

  fireEvent.click(screen.getByRole('option', { name: 'Springfield, United States' }));
  expect(originInput).toHaveValue('Springfield, United States');
  expect(originInput).toHaveAttribute('aria-expanded', 'false');
});
