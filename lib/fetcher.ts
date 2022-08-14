const fetcher = (url: string) => fetch(url).then(res => res.json())
const weatherFetcher = (url: string) =>
  fetcher(url).then(
    res =>
      Math.round(res.main.temp).toString() +
      '°C • ' +
      res.weather[0].main +
      ' • ' +
      res.wind.speed +
      ' km/h'
  )

export default fetcher
export { weatherFetcher }
