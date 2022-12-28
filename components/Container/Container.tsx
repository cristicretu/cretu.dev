import React from 'react'
import { useState } from 'react'

import { Transition } from '@headlessui/react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import Image from 'next/image'
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
  page?: string
}

export default function Container({
  footer = false,
  back,
  writingNav = '',
  showNav = true,
  children,
  title = 'Cristian Crețu - Developer & Designer.',
  description = 'Full-stack developer and digital artist.',
  image = 'https://cretu.dev/static/images/og.png',
  date,
  page,
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

  return (
    <>
      <CommandMenu opened={isOpen} setOpened={setIsOpen} />
      <div
        className={cn(
          writingNav ? 'bg-dots' : '',
          'text-primary',
          'relative h-full min-h-screen w-full',
          'flex flex-col',
          'motion-reduce:transition-none motion-reduce:transform-none',
          'md:pb-12'
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
          <nav className='sticky w-full z-[1] top-2 md:top-4 max-w-xl px-4 py-2 gap-4 mx-auto flex justify-between items-center'>
            <button
              className='button-primary-y text-3xl'
              onClick={() => setIsOpen(!isOpen)}
            >
              ⌘
            </button>
            {writingNav && (
              <div className='flex flex-row gap-1 text-tertiary bg-primary filter-blur p-3 rounded-full'>
                <Link
                  href='/'
                  className='hover:text-primary transition-all cursor-pointer'
                >
                  index
                </Link>
                <span>/</span>
                <Link
                  href='/writing'
                  className='hover:text-primary transition-all cursor-pointer'
                >
                  writing
                </Link>
                <span>/</span>
                <Link
                  href={`/writing/${writingNav}`}
                  className='hover:text-primary transition-all cursor-pointer'
                >
                  {writingNav}
                </Link>
              </div>
            )}
          </nav>
        </Transition>
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <main
              className={cn(
                'mt-20',
                writingNav
                  ? 'max-w-3xl px-4 md:px-12 lg:px-24'
                  : 'max-w-xl px-4',
                'mx-auto my-auto',
                'flex flex-col justify-center gap-12',
                'divide-y divide-gray-300 dark:divide-gray-700',
                'rounded-lg',
                writingNav
                  ? 'shadow-2xl dark:shadow-gray-800/90 py-12 bg-primary'
                  : ''
              )}
            >
              <div className='flex flex-col gap-2'>
                {back && (
                  <Link
                    href={back.href}
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
                  </Link>
                )}
                {children}
              </div>
              {footer && <Footer />}
            </main>
          </m.div>
        </LazyMotion>
      </div>
    </>
  )
}
