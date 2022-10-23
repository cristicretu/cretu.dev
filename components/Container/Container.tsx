import React, { useEffect } from 'react'

import splitbee from '@splitbee/web'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { cn } from '@lib/classNames'
import { baseUrl } from 'config/seo'

interface IContainerProps {
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

const variants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  enter: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 10 },
}

export default function Container({
  children,
  title = 'Cristian Crețu - Developer & Designer.',
  description = 'Full-stack developer and digital artist.',
  image = 'https://cretu.dev/static/images/og.png',
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

  useEffect(() => {
    splitbee.init({
      scriptUrl: '/bee.js',
      apiUrl: '/_hive',
    })
  }, [])

  return (
    <>
      <div
        className={cn(
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

        <LazyMotion features={domAnimation}>
          <m.main
            className={cn('px-4 mt-20', 'max-w-3xl', 'mx-auto my-auto')}
            initial='hidden'
            animate='enter'
            exit='exit'
            variants={variants}
            transition={{ type: 'linear', duration: 0.4 }}
          >
            {children}
          </m.main>
        </LazyMotion>
      </div>
    </>
  )
}
