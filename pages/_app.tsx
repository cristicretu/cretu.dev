import '../styles/globals.css'
import '../styles/prose.css'
import { ReactChild, ReactFragment, ReactPortal } from 'react'

import localFont from '@next/font/local'
import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'
import { NextPageContext } from 'next/types'
import { ThemeProvider } from 'next-themes'

import Layout from '@components/Layout'
import { Providers } from '@components/Providers'

const helvetica = localFont({
  src: [
    {
      path: '../public/fonts/helveticaneue-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/helveticaneue-medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
})

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = (
    page: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined
  ) => (
    <ThemeProvider disableTransitionOnChange attribute='class'>
      <Providers pageProps={pageProps as NextPageContext}>
        <Layout className={`${helvetica.className} font-sans`}>{page}</Layout>
        <Analytics />
      </Providers>
    </ThemeProvider>
  )

  return getLayout(<Component {...pageProps} />)
}

export default MyApp
