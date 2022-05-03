import { useEffect, useState } from 'react'

import { Transition } from '@headlessui/react'
import splitbee from '@splitbee/web'
import { NextSeo } from 'next-seo'
import { useTheme } from 'next-themes'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import CommandMenu from '@components/CommandMenu'
import Footer from '@components/Footer'
import { cn } from '@lib/classNames'
import { baseUrl } from 'config/seo'

interface IContainerProps {
  back?: {
    href: string
    label: string
  }
  children?: React.ReactNode
  title?: string
  description?: string
  image?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date?: any
}

export default function Container({
  back,
  children,
  title,
  description,
  image,
  date,
  ...props
}: IContainerProps): JSX.Element {
  const router = useRouter()

  const meta = {
    title,
    description,
    image,
    type: 'website',
    date,
    props,
  }

  const { resolvedTheme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  splitbee.init()

  return (
    <>
      <CommandMenu />
      <div
        className={cn(
          'bg-gray-50 dark:bg-gray-1000',
          'text-primary',
          'relative h-full min-h-screen w-full',
          'flex flex-col',
          'motion-reduce:transition-none motion-reduce:transform-none'
        )}
      >
        <Head>
          <NextSeo {...meta} />
          <meta name='robots' content='follow, index' />
          <meta property='og:url' content={`${baseUrl}${router.asPath}`} />
          <link rel='canonical' href={`${baseUrl}${router.asPath}`} />
          <meta property='og:type' content={meta.type} />
          <meta property='og:site_name' content='Cristian Crețu' />
          <meta property='og:description' content={meta.description} />
          <meta property='og:title' content={meta.title} />
          <meta property='og:image' content={meta.image} />
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:site' content='@cristicrtu' />
          <meta name='twitter:title' content={meta.title} />
          <meta name='twitter:description' content={meta.description} />
          <meta name='twitter:image' content={meta.image} />
          {meta.date && (
            <meta property='article:published_time' content={meta.date} />
          )}
        </Head>
        <Transition
          appear={true}
          show={true}
          enter='transition-all duration-500 delay-[200ms]'
          enterFrom='scale-90 opacity-0'
          enterTo='scale-100 opacity-100'
        >
          <button
            aria-label='Toggle Dark Mode'
            type='button'
            className='w-9 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center  hover:ring-2 ring-gray-300  transition-all'
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            {mounted && (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                className='w-5 h-5 text-gray-800 dark:text-gray-200'
              >
                {resolvedTheme === 'dark' ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                  />
                )}
              </svg>
            )}
          </button>
          <main
            className={cn(
              'px-4 pt-24',
              'max-w-2xl',
              'mx-auto my-auto',
              'flex flex-col justify-center gap-12',
              'divide-y divide-gray-300 dark:divide-gray-700'
            )}
          >
            <div className='flex flex-col gap-2'>
              {back && (
                <Link href={back.href}>
                  <a
                    className={cn(
                      'text-tertiary hover:text-secondary transition duration-200 ease-in-out cursor-pointer group mb-4'
                    )}
                  >
                    <span
                      aria-hidden='true'
                      className='inline-block transition-transform duration-200 ease-in-out translate-x-0 group-hover:-translate-x-1'
                    >
                      ⇤
                    </span>{' '}
                    {back.label}
                  </a>
                </Link>
              )}
              {children}
            </div>
            <footer>
              <Footer />
            </footer>
          </main>
        </Transition>
      </div>
    </>
  )
}
