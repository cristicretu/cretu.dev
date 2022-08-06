import { useEffect, useState } from 'react'

import { GitHubLogoIcon, TwitterLogoIcon } from '@modulz/radix-icons'

interface IFooterProps {
  page?: string
}

export default function Footer({ page }: IFooterProps): JSX.Element {
  const [localTime, setLocalTime] = useState('')
  const [weather, setWeather] = useState('')

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.NEXT_PUBLIC_LAT}&lon=${process.env.NEXT_PUBLIC_LON}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}&units=metric`
    )
      .then(res => res.json())
      .then(data => {
        setWeather(
          Math.round(data.main.temp).toString() +
            '°C • ' +
            data.weather[0].main +
            ' • ' +
            data.wind.speed +
            ' km/h'
        )
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err)
      })
  }, [])

  useEffect(() => {
    setLocalTime(
      new Date().toLocaleString('ro-RO', {
        timeZone: 'Europe/Bucharest',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })
    )
  }, [])

  useEffect(() => {
    setInterval(() => {
      const date = new Date()
      const time = date.toLocaleString('ro-RO', {
        timeZone: 'Europe/Bucharest',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })
      setLocalTime(time)
    }, 1000)
  })
  return (
    <footer
      className={`flex flex-col gap-9 mb-8 text-tertiary sm:px-0  ${
        page === 'index' ? 'max-w-lg' : page === 'writing' ? '' : ''
      }`}
    >
      <div className='flex flex-col'>
        <div className='border border-gray-300 dark:border-gray-700 border-dashed'></div>
        <div className='py-4 flex justify-between'>
          <span>~ Prioritize yourself.</span>
          <span className='w-16'>{localTime}</span>
        </div>
        <div className='flex justify-end'>
          <span>{weather ? weather : ''}</span>
        </div>
      </div>
      {page === 'index' && (
        <span className='text-sm'>
          © Cristian Crețu 2022. Website built using Next.js & TailwindCSS (
          <a
            href='https://github.com/cristicretu/cretu.dev'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary'
          >
            view source
          </a>
          ), deployed and hosted by{' '}
          <a
            href='https://vercel.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary'
          >
            Vercel
          </a>
          .
        </span>
      )}
      <div className='flex flex-row items-center space-x-4'>
        <a
          href='https://twitter.com/cristicrtu'
          className='visible'
          target='_blank'
          rel='noreferrer'
          aria-label='Twitter'
        >
          <TwitterLogoIcon className='w-5 h-auto text-gray-900 transition-all duration-200 fill-current dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100 text-opacity-60 hover:text-opacity-100' />
        </a>
        <a
          href='https://github.com/cristicretu/'
          className='visible'
          target='_blank'
          rel='noreferrer'
          aria-label='Github'
        >
          <GitHubLogoIcon className='w-5 h-auto text-gray-900 transition-all duration-200 fill-current dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100 text-opacity-60 hover:text-opacity-100' />
        </a>
      </div>
    </footer>
  )
}
