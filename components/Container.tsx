import { useEffect, useState } from 'react';

import Footer from './Footer';
import Head from 'next/head';
import Link from 'next/link';
import useKeypress from 'react-use-keypress';
import { useRouter } from 'next/dist/client/router';
import { useTheme } from 'next-themes';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Container(props: any) {
  const [Mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { children, ...customMeta } = props;
  const router = useRouter();
  const meta = {
    title: 'Cristian Cretu – Developer, designer',
    description: `Front-end developer, graphic-design and programming enthusiast`,
    image: 'https://cretu.dev/static/images/banner.png',
    type: 'website',
    ...customMeta
  };

  useKeypress('t', () => {
    if (Mounted === true) setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  });
  useKeypress('h', () => {
    router.back();
  });

  return (
    <div className="bg-white dark:bg-gray-900">
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta property="og:url" content={`https://cretu.dev${router.asPath}`} />
        <link rel="canonical" href={`https://cretu.dev${router.asPath}`} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content="Cristian Crețu" />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@cristicrtu" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
        {meta.date && (
          <meta property="article:published_time" content={meta.date} />
        )}
      </Head>
      <nav className="flex items-center sticky-nav justify-between w-full max-w-5xl py-3 px-2 sm:px-8 md:px-40 mx-auto bg-white dark:bg-gray-900 bg-opacity-50 text-gray-900 dark:text-gray-100">
        <div className="flex space-x-2 text-base items-center">
          <Link href="/">
            <a
              className={classNames(
                'p-1  transition-all  sm:p-4',
                router.pathname === '/'
                  ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              )}
            >
              Home
            </a>
          </Link>
          <Link href="/about">
            <a
              className={classNames(
                'p-1  transition-all  sm:p-4',
                router.pathname === '/about'
                  ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              )}
            >
              {' '}
              About
            </a>
          </Link>
          <Link href="/blog">
            <a
              className={classNames(
                'p-1  transition-all  sm:p-4',
                router.pathname === '/blog'
                  ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              )}
            >
              {' '}
              Blog
            </a>
          </Link>
          <Link href="/projects">
            <a
              className={classNames(
                'p-1  transition-all  sm:p-4',
                router.pathname === '/projects'
                  ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              )}
            >
              {' '}
              Projects
            </a>
          </Link>
        </div>
        <div className="flex flex-row space-x-4">
          <a
            href="https://twitter.com/cristicrtu"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              className="fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-gray-900 text-opacity-40 hover:text-opacity-100 transition-all duration-500 "
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              shapeRendering="geometricPrecision"
            >
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          <a
            href="https://github.com/cristicretu/"
            target="_blank"
            rel="noreferrer"
            aria-label="Github"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-gray-900 text-opacity-40 hover:text-opacity-100 transition-all duration-500 "
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </nav>
      <main id="skip" className="flex flex-col justify-center px-2">
        <div className="my-24">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
