import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link
          rel='preload'
          href='fonts/helveticaneue-medium.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        <link href='/static/favicons/favicon.ico' rel='shortcut icon' />
        <link href='/static/favicons/site.webmanifest' rel='manifest' />
        <link
          href='/static/favicons/apple-touch-icon.png'
          rel='apple-touch-icon'
          sizes='180x180'
        />
        <link
          href='/static/favicons/favicon-32x32.png'
          rel='icon'
          sizes='32x32'
          type='image/png'
        />
        <link
          href='/static/favicons/favicon-16x16.png'
          rel='icon'
          sizes='16x16'
          type='image/png'
        />
        <link
          color='#4a9885'
          href='/static/favicons/safari-pinned-tab.svg'
          rel='mask-icon'
        />
        <meta
          name='theme-color'
          content='#ffffff'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='#060606'
          media='(prefers-color-scheme: dark)'
        />{' '}
        <meta
          content='/static/favicons/browserconfig.xml'
          name='msapplication-config'
        />
        <meta
          content='fK4YqLAHjoaynXLF1e5gaPzDNOircgiYSgAwSXqr61o'
          name='google-site-verification'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
