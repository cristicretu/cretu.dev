import Document, { Head, Html, Main, NextScript } from 'next/document';

import { useTheme } from 'next-themes';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="preload"
            href="/fonts/IBMPlexSans-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/PlayfairDisplay-Regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link href="/static/favicons/site.webmanifest" rel="manifest" />
          <link href="/static/favicons/favicon.ico" rel="shortcut icon" />
          <meta
            content="/static/favicons/browserconfig.xml"
            name="msapplication-config"
          />
          <meta
            content="fK4YqLAHjoaynXLF1e5gaPzDNOircgiYSgAwSXqr61o"
            name="google-site-verification"
          />
          <meta
            name="theme-color"
            content="#fbfbfb"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="#171717"
            media="(prefers-color-scheme: dark)"
          />
        </Head>
        <body className="bg-gray-50 dark:bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
