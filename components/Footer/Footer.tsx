import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { GitHubLogoIcon, TwitterLogoIcon } from '@modulz/radix-icons'

interface IFooterProps {
  page?: string
}

function dateToLocalTime(date: Date): string {
  return date.toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

let now = ''
const notifiers = new Set()

if (typeof window !== 'undefined') {
  setInterval(() => {
    now = dateToLocalTime(new Date())
    notifiers.forEach(notify => notify())
  }, 1000)
}

function subscribe(notify: () => void): () => void {
  notifiers.add(notify)
  return () => notifiers.delete(notify)
}

export default function Footer({ page }: IFooterProps): JSX.Element {
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

  const store = useSyncExternalStore(
    subscribe,
    () => now,
    () => now
  )

  // export function useSyncExternalStore<Snapshot>(
  //   subscribe: (onStoreChange: () => void) => () => void,
  //   getSnapshot: () => Snapshot,
  //   getServerSnapshot?: () => Snapshot,
  // ): Snapshot;

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setNow(dateToLocalTime(new Date()))
  //   }, 1000)
  //   return () => clearInterval(interval)
  // }, [])

  return (
    <Suspense fallback={null}>
      <footer
        className={`flex flex-col gap-9 mb-8 text-tertiary sm:px-0  ${
          page === 'index' ? 'max-w-lg' : page === 'writing' ? '' : ''
        }`}
      >
        <div className='flex flex-col'>
          <div className='border border-gray-300 dark:border-gray-700 border-dashed'></div>
          <div className='py-4 flex justify-between'>
            <span>~ Prioritize yourself.</span>
            <span className='w-16'>{store}</span>
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
    </Suspense>
  )
}
