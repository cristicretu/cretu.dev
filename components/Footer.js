import Link from "next/dist/client/link";

function Footer() {
    return (
        <footer className="flex flex-col justify-center items-center max-w-2xl mx-auto w-full  px-2 sm:px-2 md:px-0 mb-8">
            <hr className="w-full border-1 border-gray-200 dark:border-gray-800 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
                {/* first section */}
                <div className="flex flex-col space-y-4 text-gray-500 ">
                    <Link href="/">
                        <a className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition">
                            Home
                        </a>
                    </Link>
                    <Link href="/about">
                        <a className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition">
                            About
                        </a>
                    </Link>
                    <Link href="/blog">
                        <a className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition">
                            Blog
                        </a>
                    </Link>
                    <Link href="/dashboard">
                        <a className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition">
                            Dashboard
                        </a>
                    </Link>
                </div>
                {/* middle section */}
                <div className="flex flex-col space-y-4">
                    <a
                        className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/cristicretu"
                    >
                        Github
                    </a>
                    <a
                        className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://twitter.com/cristicrtu"
                    >
                        Twitter
                    </a>
                    <a
                        className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.linkedin.com/in/crisemcr/"
                    >
                        Linkedin
                    </a>
                    <a
                        className="text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-gray-900 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.behance.net/cristicretu1"
                    >
                        Behance
                    </a>
                </div>
                {/* third section */}
                <div className="flex flex-col space-y-2"></div>
            </div>
            <h3 className="text-gray-700 dark:text-gray-300 text-opacity-90 mt-8 text-xs px-8 text-center">
                Created with &hearts; by{" "}
                <a
                    className="underline text-blue-500 dark:text-blue-400 dark:hover:text-blue-500 hover:text-blue-700 transition text-opacity-70 font-semibold"
                    href="https://github.com/cristicretu/cretu.dev"
                >
                    Cristian Crețu
                </a>
                . Deployed with{" "}
                <a
                    className="underline text-blue-500 dark:text-blue-400 dark:hover:text-blue-500 hover:text-blue-700 transition text-opacity-70 font-semibold"
                    href="https://vercel.com"
                >
                    ▲ Vercel
                </a>
            </h3>
        </footer>
    );
}

export default Footer;
