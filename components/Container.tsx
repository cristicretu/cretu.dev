import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { JSXElementConstructor, useEffect, useState } from 'react';

import Footer from './Footer';
import Head from 'next/head';
import Link from 'next/link';
import MobileMenu from './MobileMenu';
import useKeypress from 'react-use-keypress';
import { useRouter } from 'next/dist/client/router';
import { useTheme } from 'next-themes';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const NavItem = ({ myHref, text }) => {
  const router = useRouter();
  const isActive = router.asPath === myHref;

  return (
    <Link href={myHref}>
      <a
        className={classNames(
          ' hidden md:inline-block sm:px-3 sm:py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all',
          isActive
            ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-normal'
        )}
      >
        {text}
      </a>
    </Link >
  )
}

export default function Container(props: any) {
  const [Mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

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
    <div className="bg-gray-50 dark:bg-gray-900">
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
      <nav className="flex items-center justify-between w-full relative max-w-2xl border-gray-200 dark:border-gray-700 mx-auto  pt-6 px-5 sm:px-4 md:px-0 text-gray-900 bg-gray-50  dark:bg-gray-900 bg-opacity-60 dark:text-gray-100">

        <div className="flex space-x-2 text-base items-center ml-[-0.81rem]">
          <MobileMenu />
          <NavItem myHref={"/"} text={"Home"} />
          <NavItem myHref={"/about"} text={"About"} />
          <NavItem myHref={"/blog"} text={"Blog"} />
          <NavItem myHref={"/projects"} text={"Projects"} />


        </div>
        <div className="flex flex-row space-x-4 items-center">
          <a
            href="https://twitter.com/cristicrtu"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <TwitterLogoIcon className="fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-gray-900 text-opacity-40 hover:text-opacity-100 transition-all duration-200 w-5 h-auto" />
          </a>
          <a
            href="https://github.com/cristicretu/"
            target="_blank"
            rel="noreferrer"
            aria-label="Github"
          >
            <GitHubLogoIcon className="fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-gray-900 text-opacity-40 hover:text-opacity-100 transition-all duration-200 w-5 h-auto" />
          </a>
          <button
            aria-label="Toggle Dark Mode"
            type="button"
            className="w-9 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center  hover:ring-2 ring-gray-300  transition-all"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            {Mounted && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 text-gray-800 dark:text-gray-200"
              >
                {resolvedTheme === 'dark' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                )}
              </svg>
            )}
          </button>
        </div>
      </nav>
      <main className="flex flex-col justify-centert px-2 bg-gray-50 dark:bg-gray-900"
      >
        <div className="my-14 sm:my-16 md:my-20 lg:my-24">{children}</div>
        <Footer />
      </main>
    </div >
  );
}
