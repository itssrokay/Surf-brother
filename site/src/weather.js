// Forecast validation is separate from the view: old or missing data never becomes “now”.
export function currentWeather(data, now = Date.now()) {
  const series = data?.properties?.timeseries;
  const updated = Date.parse(data?.properties?.meta?.updated_at);
  if (!Array.isArray(series) || !Number.isFinite(updated) || now - updated > 24 * 3600000 || updated > now + 3600000)
    throw new Error('Weather data is not current');
  const nearest = series.reduce((best, item) => {
    const time = Date.parse(item.time);
    if (!Number.isFinite(time)) return best;
    return !best || Math.abs(time - now) < Math.abs(Date.parse(best.time) - now) ? item : best;
  }, null);
  if (!nearest || Math.abs(Date.parse(nearest.time) - now) > 90 * 60000) throw new Error('No current forecast hour');
  const details = nearest.data?.instant?.details;
  if (!Number.isFinite(details?.air_temperature) || details.air_temperature < -30 || details.air_temperature > 60)
    throw new Error('Temperature unavailable');
  return {
    temperature: Math.round(details.air_temperature),
    wind: Number.isFinite(details.wind_speed) && details.wind_speed >= 0 ? Math.round(details.wind_speed * 3.6) : null,
    humidity: Number.isFinite(details.relative_humidity) && details.relative_humidity >= 0 && details.relative_humidity <= 100 ? Math.round(details.relative_humidity) : null,
    symbol: nearest.data?.next_1_hours?.summary?.symbol_code || nearest.data?.next_6_hours?.summary?.symbol_code || '',
    validAt: nearest.time, updatedAt: data.properties.meta.updated_at,
  };
}
export function weatherLabel(symbol) {
  if (typeof symbol !== 'string') return 'Near-hour forecast';
  if (symbol.includes('thunder')) return 'Thunderstorms';
  if (symbol.includes('rain')) return 'Rain nearby';
  if (symbol.includes('snow') || symbol.includes('sleet')) return 'Wintry conditions';
  if (symbol.includes('fog')) return 'Fog';
  if (symbol.includes('partlycloudy')) return 'Partly cloudy';
  if (symbol.includes('fair')) return 'Mostly clear';
  if (symbol.includes('cloudy')) return 'Cloudy';
  if (symbol.includes('clearsky')) return 'Clear skies';
  return 'Near-hour forecast';
}
