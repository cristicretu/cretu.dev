import { NextSeo } from 'next-seo'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { baseUrl } from 'config/seo'

interface IContainerProps {
  children?: React.ReactNode
  title?: string
  description?: string
  image?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any
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
    <div className='bg-gray-50 dark:bg-gray-900 relative flex h-full min-h-screen w-full'>
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
      <div className='flex flex-col justify-center px-8'>
        <nav className='flex items-center justify-between w-full relative max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pt-8 pb-8 sm:pb-16  text-gray-900 bg-gray-50  dark:bg-gray-900 bg-opacity-60 dark:text-gray-100'>
          {/* <MobileMenu />
            <NavItem href='/' text='Home' />
            <NavItem href='/guestbook' text='Guestbook' />
            <NavItem href='/dashboard' text='Dashboard' />
            <NavItem href='/blog' text='Blog' />
            <NavItem href='/snippets' text='Snippets' /> */}
        </nav>
      </div>
      <main className='flex flex-col justify-center px-8 bg-gray-50 dark:bg-gray-900'>
        {children}
        {/* <Footer /> */}
      </main>
    </div>
  )
}
