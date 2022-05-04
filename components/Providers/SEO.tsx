import { DefaultSeo } from 'next-seo'
import Head from 'next/head'

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
        <meta
          name='theme-color'
          content='#fff'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='rgb(23, 23, 23)'
          media='(prefers-color-scheme: dark)'
        />
      </Head>
    </>
  )
}
