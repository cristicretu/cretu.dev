import {
  GitHubLogoIcon,
  Half2Icon,
  TwitterLogoIcon
} from '@radix-ui/react-icons';
import React, { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@radix-ui/react-toggle-group';

import Footer from 'components/Footer';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';
import { useTheme } from 'next-themes';

interface ContainerProps {
  title?: String;
  description?: String;
  image?: String;
  date?: String;
  type?: String;
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const NavItem = ({ myHref, text }) => {
  const router = useRouter();
  const isActive = router.asPath === myHref;

  return (
    <Link href={myHref}>
      <a
        className={cn(
          '  md:inline-block sm:px-3 sm:py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all',
          isActive
            ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-normal'
        )}
      >
        {text}
      </a>
    </Link>
  );
};

const Container: React.FC<ContainerProps> = (props: any) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [showBackButton, setShowBackButton] = useState(false);

  const router = useRouter();
  const { children, ...customMeta } = props;
  const meta = {
    title: 'Cristian Crețu - Developer, designer.',
    description: 'Full-stack developer and digital art creator.',
    image: 'https://cretu.dev/static/images/banner.png',
    type: 'website',
    ...customMeta
  };

  function storePathValues() {
    const storage = globalThis?.sessionStorage;

    if (!storage) return;

    const prevPath = storage.getItem('currentPath');

    if (!prevPath) {
      setShowBackButton(false);
      return;
    }

    if (prevPath.length) {
      setShowBackButton(true);
    }
    storage.setItem('prevPath', prevPath);
    storage.setItem('currentPath', globalThis.location.pathname);
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => storePathValues, [router.asPath]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans capsize">
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
        <div className="flex space-x-2 text-base items-center ml-[-0.64rem]">
          {/* <MobileMenu /> */}
          <NavItem myHref={'/'} text={'Home'} />
          <NavItem myHref={'/writing'} text={'Writing'} />
          {/* <NavItem myHref={'/projects'} text={'Projects'} /> */}
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
          <ToggleGroup
            type="single"
            defaultValue="center"
            aria-label="Text alignment"
            className="flex items-center"
          >
            <ToggleGroupItem value="left" aria-label="Left aligned">
              <button
                className={cn(
                  'w-9 h-9 flex items-center justify-center transition-all mr-0 rounded-l-lg border-r-[1px] border-gray-400 border-opacity-30 hover:bg-gray-300 dark:hover:bg-gray-700',
                  theme === 'light'
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : 'bg-gray-200 dark:bg-gray-600'
                )}
                onClick={() => setTheme('light')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-800 dark:text-gray-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center aligned">
              <button
                className={cn(
                  'w-9 h-9 flex items-center justify-center transition-all  border-gray-400 border-opacity-30 hover:bg-gray-300 dark:hover:bg-gray-700',
                  theme === 'dark'
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : 'bg-gray-200 dark:bg-gray-600'
                )}
                onClick={() => setTheme('dark')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-800 dark:text-gray-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </button>
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right aligned">
              <button
                className={cn(
                  'w-9 h-9 flex items-center justify-center transition-all rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-700',
                  theme === 'system'
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : 'bg-gray-200 dark:bg-gray-600'
                )}
                onClick={() => setTheme('system')}
              >
                <Half2Icon />
              </button>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </nav>
      <div className="flex flex-col justify-center px-4 py-2 motion-reduce:transition-none motion-reduce:transform-none">
        <main className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 mx-auto flex flex-col justify-center mt-14 sm:mt-16 md:mt-20 lg:mt-24 mb-4 max-w-2xl">
          {/* <span><button onClick={() => router.back()}><span>←</span>{" "}Back</button></span> */}
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Container;
