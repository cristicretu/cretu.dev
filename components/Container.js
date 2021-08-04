import Head from "next/head";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import Footer from "./Footer";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Container(props) {
    const [Mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

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

    return (
        <div className="bg-white dark:bg-black">
            <Head>
                <title>{meta.title}</title>
                <meta name="robots" content="follow, index" />
                <meta content={meta.description} name="description" />
                <meta
                    property="og:url"
                    content={`https://cretu.dev${router.asPath}`}
                />
                <link
                    rel="canonical"
                    href={`https://cretu.dev${router.asPath}`}
                />
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
                    <meta
                        property="article:published_time"
                        content={meta.date}
                    />
                )}
            </Head>
            <nav className="flex items-center sticky-nav justify-between w-full max-w-5xl py-6 px-10 mx-auto bg-white dark:bg-black bg-opacity-50 text-gray-900 dark:text-gray-100">
                <div className="flex space-x-2 text-base">
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
                <button
                    aria-label="Toggle Dark Mode"
                    type="button"
                    className="w-10 h-10 p-3 bg-gray-200 rounded dark:bg-gray-800"
                    onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                    }
                >
                    {Mounted && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            className="w-4 h-4 text-gray-800 dark:text-gray-200"
                        >
                            {theme === "dark" ? (
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
            </nav>
            <main id="skip" className="flex flex-col justify-center px-8">
                {children}
                <Footer />
            </main>
        </div>
    );
}
