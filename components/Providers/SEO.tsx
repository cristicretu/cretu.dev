import { DefaultSeo } from 'next-seo'
import Head from 'next/head'

import { defaultSEO } from 'config/seo'

export function SEO() {
  return (
    <>
      <DefaultSeo {...defaultSEO} />

      <Head>
        <link rel='icon' href='/static/favicon.ico' sizes='any' />
        <link
          rel='icon'
          href='/static/favicon.svg'
          type='image/svg+xml'
          sizes='any'
        />
        <link rel='mask-icon' href='/static/meta/mask-icon.svg' />
        <link rel='apple-touch-icon' href='/static/meta/apple-touch-icon.png' />
        <link rel='manifest' href='/static/meta/manifest.webmanifest' />
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
