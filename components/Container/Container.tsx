import React from 'react'
import { useState } from 'react'

import { Transition } from '@headlessui/react'
import { GitHubLogoIcon, TwitterLogoIcon } from '@modulz/radix-icons'
import splitbee from '@splitbee/web'
import { NextSeo } from 'next-seo'
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
  footer?: boolean
  showNav?: boolean
  writingNav?: string
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
  footer = true,
  back,
  writingNav = '',
  showNav = true,
  children,
  title = 'Cristian Crețu - Developer & Designer.',
  description = 'Full-stack developer and digital artist.',
  image = 'https://cretu.dev/static/images/banner.png',
  date,
  ...props
}: IContainerProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const meta = {
    title,
    description,
    image,
    type: 'website',
    date,
    props,
  }
  splitbee.init()

  return (
    <>
      <CommandMenu opened={isOpen} setOpened={setIsOpen} />
      <div
        className={cn(
          writingNav ? 'bg-dots' : '',
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
          as={React.Fragment}
          show={showNav}
          enter='transition duration-100 ease-in-out'
          enterFrom='opacity-0 scale-90'
          enterTo='opacity-100 scale-100'
          leave='transition ease-in-out'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <nav className='sticky w-full bg-gray-100/40 z-[1] filter-blur dark:bg-gray-1000/40 top-2 md:top-4 max-w-2xl px-4 py-2 rounded-md mx-auto flex justify-between items-center'>
            <button
              className='button-primary-y text-3xl'
              onClick={() => setIsOpen(!isOpen)}
            >
              ⌘
            </button>
            {writingNav && (
              <div className='flex flex-row gap-1 text-tertiary'>
                <Link href='/'>
                  <a className='hover:text-primary transition-all cursor-pointer'>
                    index
                  </a>
                </Link>
                <span>/</span>
                <Link href='/writing'>
                  <a className='hover:text-primary transition-all cursor-pointer'>
                    writing
                  </a>
                </Link>
                <span>/</span>
                <Link href={`/writing/${writingNav}`}>
                  <a className='hover:text-primary transition-all cursor-pointer'>
                    {writingNav}
                  </a>
                </Link>
              </div>
            )}
            {!writingNav && (
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
            )}
          </nav>
        </Transition>
        <Transition
          appear={true}
          show={true}
          enter='transition-all duration-500 delay-[200ms]'
          enterFrom='scale-90 opacity-0'
          enterTo='scale-100 opacity-100'
        >
          <main
            className={cn(
              'px-4 mt-20',
              'max-w-2xl',
              'mx-auto my-auto',
              'flex flex-col justify-center gap-12',
              'divide-y divide-gray-300 dark:divide-gray-700',
              'rounded-lg',
              writingNav ? 'shadow-2xl dark:shadow-gray-800/90 pt-6' : ''
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
            {footer && (
              <footer>
                <Footer />
              </footer>
            )}
          </main>
        </Transition>
      </div>
    </>
  )
}
