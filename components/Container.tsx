import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { JSXElementConstructor, useEffect, useState } from 'react';

import Footer from './Footer';
import Head from 'next/head';
import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
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
          ' pr-1 hidden md:inline-block transition-all   sm:pr-4',
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
      <nav className="flex items-center justify-between w-full relative max-w-2xl py-6 mx-auto px-4 md:px-0 bg-white dark:bg-gray-900  text-gray-900 dark:text-gray-100">
        <div className="flex space-x-2 text-base items-center">
          <MobileMenu />
          <NavItem myHref={"/"} text={"Home"} />
          <NavItem myHref={"/about"} text={"About"} />
          <NavItem myHref={"/blog"} text={"Blog"} />
          <NavItem myHref={"/projects"} text={"Projects"} />


        </div>
        <div className="flex flex-row space-x-4">
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
        </div>
      </nav>
      <main id="skip" className="flex flex-col justify-center px-4">
        <div className="my-24">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
