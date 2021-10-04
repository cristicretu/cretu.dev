import Head from "next/head";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import Footer from "./Footer";
import useKeypress from "react-use-keypress";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Container(props) {
  const [Mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { children, ...customMeta } = props;
  const router = useRouter();
  const meta = {
    title: "Cristian Cretu – Developer, designer",
    description: `Front-end developer, graphic-design and programming enthusiast`,
    image: "https://cretu.dev/static/images/banner.png",
    type: "website",
    ...customMeta,
  };

  useKeypress("t", () => {
    if (Mounted === true) setTheme(resolvedTheme === "dark" ? "light" : "dark");
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
      <nav className="flex items-center sticky-nav justify-between w-full max-w-5xl py-6 px-2 sm:px-8 md:px-40 mx-auto bg-white dark:bg-gray-900 bg-opacity-50 text-gray-900 dark:text-gray-100">
        <div className="flex space-x-2 text-base items-center">
          <Link href="/">
            <a
              className={classNames(
                "p-1  transition-all  sm:p-4",
                router.pathname === "/"
                  ? "text-blue-300 hover:text-blue-500"
                  : "text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-300"
              )}
            >
              Home
            </a>
          </Link>
          <Link href="/about">
            <a
              className={classNames(
                "p-1  transition-all  sm:p-4",
                router.pathname === "/about"
                  ? "text-blue-300 hover:text-blue-500"
                  : "text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-300"
              )}
            >
              {" "}
              About
            </a>
          </Link>
          <Link href="/blog">
            <a
              className={classNames(
                "p-1  transition-all  sm:p-4",
                router.pathname === "/blog"
                  ? "text-blue-300 hover:text-blue-500"
                  : "text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-300"
              )}
            >
              {" "}
              Blog
            </a>
          </Link>
          <Link href="/dashboard">
            <a
              className={classNames(
                "p-1  transition-all  sm:p-4",
                router.pathname === "/dashboard"
                  ? "text-blue-300 hover:text-blue-500"
                  : "text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-300"
              )}
            >
              {" "}
              Dashboard
            </a>
          </Link>
        </div>
        <div className="flex flex-row space-x-4">
          <a
            href="https://twitter.com/cristicrtu"
            target="_blank"
            rel="noopener"
            aria-label="Twitter"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-gray-900 text-opacity-40 hover:text-opacity-100 transition-all duration-500 "
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </a>
          <a
            href="https://github.com/cristicretu/"
            target="_blank"
            rel="noopener"
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
