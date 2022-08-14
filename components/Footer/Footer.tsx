import { Suspense, useSyncExternalStore } from 'react'

import { GitHubLogoIcon, TwitterLogoIcon } from '@modulz/radix-icons'
import useSWR from 'swr'

import { weatherFetcher } from '@lib/fetcher'

interface IFooterProps {
  page?: string
}

// ----------------------------------------------------------- DATE -----------------------------------------------------------

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
    notifiers.forEach(notify => {
      return notify()
    })
  }, 1000)
}

function subscribe(notify: () => void): () => void {
  notifiers.add(notify)
  return () => notifiers.delete(notify)
}

// ----------------------------------------------------------- WEATHER -----------------------------------------------------------

const API = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.NEXT_PUBLIC_LAT}&lon=${process.env.NEXT_PUBLIC_LON}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}&units=metric`

export default function Footer({ page }: IFooterProps): JSX.Element {
  const { data } = useSWR(API, weatherFetcher, { suspense: true })

  const store = useSyncExternalStore(
    subscribe,
    () => now,
    () => now
  )

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
            <span className='w-16'>{store ? store : '--------'}</span>
          </div>
          <div className='flex justify-end'>
            <Suspense fallback={null}>
              <span>{data}</span>
            </Suspense>
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
