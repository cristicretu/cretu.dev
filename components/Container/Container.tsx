import React from 'react'

import { Transition } from '@headlessui/react'
import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'

import CommandMenu from '@components/CommandMenu'
import Footer from '@components/Footer'
import { classNames } from '@lib/classNames'

export default function Container(props) {
  const router = useRouter()
  const { children, ...customMeta } = props
  const meta = {
    title: 'Cristian Crețu - Developer, designer.',
    description: 'Full-stack developer and digital art creator.',
    image: 'https://cretu.dev/static/images/banner.png',
    type: 'website',
    ...customMeta,
  }

  const [open, setOpen] = React.useState(false)

  return (
    <div className='font-sans min-h-max text-gray-800 polka dark:text-gray-200'>
      <Head>
        <title>{meta.title}</title>
        <meta name='robots' content='follow, index' />
        <meta content={meta.description} name='description' />
        <meta property='og:url' content={`https://cretu.dev${router.asPath}`} />
        <link rel='canonical' href={`https://cretu.dev${router.asPath}`} />
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
        <meta name='twitter:creator' content='@cristicrtu' />
        {meta.date && (
          <meta property='article:published_time' content={meta.date} />
        )}
      </Head>

      <CommandMenu buttonOpen={open} setButtonOpen={setOpen} />

      <nav className='new-sticky-nav max-w-2xl px-4 py-2 rounded-md mx-auto flex justify-between items-center'>
        <button
          aria-label='Command Menu'
          type='button'
          className={classNames(
            'inline-flex justify-center px-3 py-2 text-2xl font-extralight rounded-md',
            'text-gray-900 bg-white hover:bg-gray-50 dark:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700',
            'border border-gray-300 dark:border-gray-600',
            'focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75'
          )}
          onClick={() => {
            setOpen(true)
          }}
        >
          ⌘
        </button>
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
      </nav>

      <Transition
        appear={true}
        show={true}
        enter='transition-all duration-500 delay-[300ms]'
        enterFrom='scale-90 opacity-0'
        enterTo='scale-100 opacity-100'
      >
        <main className='flex flex-col justify-center flex-grow max-w-2xl px-4 py-12 mx-auto my-auto text-gray-800 motion-reduce:transition-none motion-reduce:transform-none dark:text-gray-200'>
          {children}
        </main>
        <Footer />
      </Transition>
    </div>
  )
}
