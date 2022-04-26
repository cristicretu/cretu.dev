import { Transition } from '@headlessui/react'
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
}

export default function Container({
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

  return (
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
        <main className='flex flex-col justify-center max-w-2xl px-4 py-12 mx-auto my-auto'>
          <div>{children}</div>
        </main>
      </Transition>
    </div>
  )
}
