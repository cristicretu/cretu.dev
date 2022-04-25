import '../styles/globals.css'
import '../styles/prose.css'
import { ReactChild, ReactFragment, ReactPortal } from 'react'

import type { AppProps } from 'next/app'

import Layout from '@components/Layout'
import { Providers } from '@components/Providers'

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout =
    Component.getLayout ||
    ((
      page:
        | boolean
        | ReactChild
        | ReactFragment
        | ReactPortal
        | null
        | undefined
    ) => (
      <Providers pageProps={pageProps}>
        <Layout>{page}</Layout>
      </Providers>
    ))

  return getLayout(<Component {...pageProps} />)
}

export default MyApp
