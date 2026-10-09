import test from 'node:test';
import assert from 'node:assert/strict';
import { currentWeather, weatherLabel } from './weather.js';
const now = Date.parse('2026-10-09T12:20:00Z');
const forecast = (details = { air_temperature: 27.4, wind_speed: 3, relative_humidity: 82 }) => ({ properties: {
  meta: { updated_at: '2026-10-09T11:00:00Z' },
  timeseries: [
    { time: '2026-10-09T06:00:00Z', data: { instant: { details: { air_temperature: 21 } } } },
    { time: '2026-10-09T12:00:00Z', data: { instant: { details }, next_1_hours: { summary: { symbol_code: 'partlycloudy_day' } } } },
  ],
} });

test('weather selects the nearest hour, converts wind units and preserves genuine zero readings', () => {
  const w = currentWeather(forecast(), now);
  assert.equal(w.temperature, 27);
  assert.equal(w.wind, 11);
  assert.equal(w.humidity, 82);
  assert.equal(w.validAt, '2026-10-09T12:00:00Z');
  const zero = currentWeather(forecast({ air_temperature: 0, wind_speed: 0, relative_humidity: 0 }), now);
  assert.equal(zero.temperature, 0);
  assert.equal(zero.wind, 0);
  assert.equal(zero.humidity, 0);
});
test('outdated models and missing current hours cannot appear as current temperature', () => {
  assert.throws(() => currentWeather(forecast(), now + 26 * 3600000));
  assert.throws(() => currentWeather(forecast(), now + 3 * 3600000));
  const invalid = forecast(); invalid.properties.meta.updated_at = 'invalid';
  assert.throws(() => currentWeather(invalid, now));
});
test('missing temperatures fail honestly; missing optional readings remain unavailable', () => {
  assert.throws(() => currentWeather(forecast({ air_temperature: null }), now));
  const w = currentWeather(forecast({ air_temperature: 28 }), now);
  assert.equal(w.wind, null); assert.equal(w.humidity, null);
  assert.equal(weatherLabel('unrecognised'), 'Near-hour forecast');
  assert.equal(weatherLabel(null), 'Near-hour forecast');
  assert.equal(weatherLabel('heavyrainandthunder'), 'Thunderstorms');
});
