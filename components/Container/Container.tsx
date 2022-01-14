import {
  GitHubLogoIcon,
  Half2Icon,
  TwitterLogoIcon
} from '@radix-ui/react-icons';
import React, { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@radix-ui/react-toggle-group';

import Footer from 'components/Footer/Footer';
import Head from 'next/head';
import Link from 'next/link';
import ThemeSwitcher from '@components/ThemeSwitcher';
import { useRouter } from 'next/dist/client/router';
import { useTheme } from 'next-themes';

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

export default function Container(props) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [offset, setOffset] = useState(0);

  const router = useRouter();
  const { children, ...customMeta } = props;
  const meta = {
    title: 'Cristian Crețu - Developer, designer.',
    description: 'Full-stack developer and digital art creator.',
    image: 'https://cretu.dev/static/images/banner.png',
    type: 'website',
    ...customMeta
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);

    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800 polka dark:text-gray-200 capsize">
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
        <meta name="twitter:creator" content="@cristicrtu" />
        {meta.date && (
          <meta property="article:published_time" content={meta.date} />
        )}
      </Head>
      <nav
        className={cn(
          'w-full px-4 py-3 mx-auto border-b border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 sticky-nav'
        )}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex space-x-2 text-base items-center md:ml-[-0.64rem]">
            <NavItem myHref={'/'} text={'Home'} />
            <NavItem myHref={'/writing'} text={'Writing'} />
          </div>
          <div className="flex flex-row items-center space-x-4">
            <a
              href="https://twitter.com/cristicrtu"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <TwitterLogoIcon className="w-5 h-auto text-gray-900 transition-all duration-200 fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-opacity-40 hover:text-opacity-100" />
            </a>
            <a
              href="https://github.com/cristicretu/"
              target="_blank"
              rel="noreferrer"
              aria-label="Github"
            >
              <GitHubLogoIcon className="w-5 h-auto text-gray-900 transition-all duration-200 fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-opacity-40 hover:text-opacity-100" />
            </a>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
      <div className="flex flex-col justify-center px-4 py-2 motion-reduce:transition-none motion-reduce:transform-none">
        <main className="flex flex-col justify-center max-w-2xl mx-auto text-gray-800 dark:text-gray-200 mt-14 sm:mt-16 md:mt-20 lg:mt-24">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
