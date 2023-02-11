import Head from 'next/head'
import { DefaultSeo } from 'next-seo'

import { defaultSEO } from 'config/seo'

export function SEO() {
  return (
    <>
      <DefaultSeo {...defaultSEO} />

      <Head>
        <link rel='icon' href='/static/favicons/favicon.ico' sizes='any' />
        <link
          rel='icon'
          href='/static/favicons/favicon.svg'
          type='image/svg+xml'
          sizes='any'
        />
        <link
          rel='apple-touch-icon'
          href='/static/favicons/apple-touch-icon.png'
        />
        <link rel='manifest' href='/static/favicons/site.webmanifest' />
      </Head>
    </>
  )
}
