import './css/style.css';
import icons from './img/icons.svg';
import { getWeatherIcon } from './helpers';

// Selecting DOM Els
const geoBtn = document.querySelector('.header__icon-box');

const searchInpt = document.querySelector('.header__input');
const searchForm = document.querySelector('.header__search');
const currPosEl = document.querySelector('.header__position-text');
const forecast = document.querySelector('.forecast');
const overview = document.querySelector('.overview');

class Weather {
  constructor() {
    this.data = {};
  }

  async reverseGeocode({ latitude, longitude }) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      if (!res.ok) return alert('Problem getting your location data');
      const geoData = await res.json();

      const { country, country_code } = geoData.address;

      currPosEl.textContent = `${country_code.toUpperCase()}, ${country}`;
    } catch (err) {
      console.log(err);
    }
  }

  async getLocation() {
    currPosEl.textContent = 'Loading...';
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.fetchWeather({ latitude, longitude });
          this.reverseGeocode(pos.coords);
        },
        (err) => {
          if (err.message.toLowerCase().includes('denied')) alert('Please allow Geolocation');
          console.error(err);
        }
      );
    });
  }

  renderLoader() {
    forecast.innerHTML = '';
    overview.innerHTML = '';

    const html = `<div class="loader__container">
          <div class="loader"></div>
        </div>`;

    forecast.insertAdjacentHTML('afterbegin', html);
  }

  async fetchWeather({ latitude, longitude }) {
    this.renderLoader();
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,rain,weather_code,surface_pressure,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,weather_code&hourly=visibility`
      );

      if (!res.ok) throw new Error('Failed fetching weather');

      this.data = await res.json();

      this.render();
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

  async geoCoding(location) {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
      );
      const geoData = await res.json();

      if (!geoData.results) throw new Error('Location not Found');

      const { latitude, longitude, name, country_code } = geoData.results.at(0);

      currPosEl.textContent = `${country_code}, ${name}`;
      this.fetchWeather({ latitude, longitude });
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  }

  formatDate(date, type) {
    return Intl.DateTimeFormat('en', {
      weekday: type,
    }).format(date);
  }

  generateCards() {
    // Daily data
    const { temperature_2m_max, temperature_2m_min, weather_code, time } = this.data.daily;

    return temperature_2m_max
      .map((tempMax, i) => {
        if (i === 0) return;
        const icon = getWeatherIcon(weather_code[i]);
        return `
        <div class="card-sub">
            <p class="card-sub__date">${this.formatDate(new Date(time[i]), 'short')}</p>
            <svg>
              <use href="${icons}#${icon}"></use>
            </svg>
            <p class="text-temperature mt-1">${
              temperature_2m_min[i]
            }&deg; &nbsp;&nbsp;${tempMax}&deg;</p>
          </div>
      `;
      })
      .join('');
  }

  render() {
    forecast.innerHTML = '';

    // Curr Data
    const {
      time: timeStr,
      temperature_2m,
      wind_speed_10m,
      apparent_temperature,
      surface_pressure,
      rain,
      relative_humidity_2m,
      weather_code,
    } = this.data.current;
    const time = new Date(timeStr);

    const sunrise = new Date(this.data.daily.sunrise[0]);
    const sunset = new Date(this.data.daily.sunset[0]);
    const UVindex = this.data.daily.uv_index_max[0];
    const visibility = this.data.hourly.visibility[0];

    const currIcon = getWeatherIcon(weather_code);

    const html = `
          <div class="card-main">
            <div class="card__date mb-tn">
              <span>${this.formatDate(time, 'long')}</span>
              <span>${time.getHours()}:${String(time.getMinutes()).padEnd(2, '0')} ${
      time.getHours() > 12 ? 'PM' : 'AM'
    }</span>
            </div>
            <div class="fx gp-1">
              <div class="card-main__details">
                <p class="card-main__temperature mb-sm">${Math.round(temperature_2m)}&deg;</p>
                <p>Feel's like<strong class="cl-d">${apparent_temperature}&deg;</strong></p>
                <p>Wind N-E <strong class="cl-d">${wind_speed_10m}km/h</strong></p>
                <p>Pressure<strong class="cl-d">${surface_pressure}MB</strong></p>
                <p>Rain<strong class="cl-d">${rain}mm</strong></p>
              </div>
              <div class="card-main__details">
                <div class="align-right">
                  <svg class="mb-tn card-main__img">
                    <use href="${icons}#${currIcon}"></use>
                  </svg>
                </div>
                <p>Sunrise<strong class="cl-d">${sunrise.getHours()}:${String(
      sunrise.getMinutes()
    ).padEnd(2, '0')}${sunrise.getHours() > 12 ? 'PM' : 'AM'}</strong></p>
                <p>Sunset <strong class="cl-d">${sunset.getHours()}:${String(
      sunset.getMinutes()
    ).padEnd(2, '0')}${sunset.getHours() > 12 ? 'PM' : 'AM'}</strong></p>
              </div>
            </div>
          </div>

          ${this.generateCards()}
        </div>
    `;

    forecast.insertAdjacentHTML('afterbegin', html);

    const overviewMarkup = `
    <div class="overview__card">
            <p class="align-self">UV Index</p>
            <svg class="overview__img align-center">
              <use href="${icons}#uv"></use>
            </svg>
            <div class="align-center">
              <p><strong>${UVindex} </strong>UV</p>
            </div>
          </div>
          <div class="overview__card">
            <p class="align-self">Visibility</p>
            <svg class="overview__img">
              <use href="${icons}#visibility"></use>
            </svg>
            <div>
              <p><strong>${visibility}</strong> m</p>
            </div>
          </div>
          <div class="overview__card">
            <p class="align-self">Humidity</p>
            <svg class="overview__img">
              <use href="${icons}#humidity"></use>
            </svg>
            <div>
              <p><strong>${relative_humidity_2m}</strong> %</p>
            </div>
          </div>
    `;

    overview.innerHTML = '';
    overview.insertAdjacentHTML('afterbegin', overviewMarkup);
  }
}

const weather = new Weather();

// Events
geoBtn.addEventListener('click', weather.getLocation.bind(weather));

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (searchInpt.value.length < 3) return;
  const location = searchInpt.value;
  weather.geoCoding(location);
  searchInpt.blur();
  searchInpt.value = '';
});
