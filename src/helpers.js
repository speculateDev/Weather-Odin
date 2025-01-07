export function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], 'clear'], // Clear sky
    [[1, 2], 'partly-cloudy'], // Mostly clear
    [[3], 'cloudy'], // Overcast
    [[45, 48], 'fog'], // Fog
    [[51, 56, 61, 66, 80], 'light'], // Drizzle: Light
    [[53, 55, 63, 65, 57, 67, 81, 82], 'moderate'], // Drizzle: Moderate
    [[71, 73, 75, 77, 85, 86], 'snow'], // Snow: Light
    [[95], 'thunder'], // Thunderstorm: Light or moderate
    [[96, 99], 'thunder-rain'], //Thunderstorm with hail: Light
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return 'NOT FOUND';
  return icons.get(arr);
}
