import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col bottom-0 justify-center items-center max-w-2xl mx-auto w-full  px-2 sm:px-2 md:px-0">
      <hr className="w-full border-1 border-gray-200 dark:border-gray-800 mb-8" />
      <div className="max-w-2xl mx-auto grid grid-cols-2 grid-rows-4">
        <p className="mr-10 mb-2 text-gray-600 dark:text-gray-400">Twitter</p>
        <a
          className="text-gray-800 arrow font-semibold dark:text-gray-200 dark:hover:text-gray-100 hover:text-gray-900 transition"
          target="_blank"
          rel="noopener noreferrer"
          href="https://twitter.com/cristicrtu"
        >
          cristicrtu ↗
        </a>

        <p className="mr-10 mb-2  text-gray-600 dark:text-gray-400">Linkedin</p>
        <a
          className="text-gray-800 arrow font-semibold dark:text-gray-200 dark:hover:text-gray-100 hover:text-gray-900 transition"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.linkedin.com/in/crisemcr/"
        >
          crisemcr ↗
        </a>

        <p className="mr-10 mb-2 text-gray-600 dark:text-gray-400">Behance</p>
        <a
          className="text-gray-800 arrow font-semibold dark:text-gray-200 dark:hover:text-gray-100 hover:text-gray-900 transition"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.behance.net/cristicretu1"
        >
          cristicretu1 ↗
        </a>

        <p className="mr-10 mb-2 text-gray-600 dark:text-gray-400">GitHub</p>
        <a
          className="text-gray-800 arrow font-semibold dark:text-gray-200 dark:hover:text-gray-100 hover:text-gray-900 transition"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/cristicretu"
        >
          cristicretu ↗
        </a>

        <p className="mr-10 mb-2 text-gray-600 dark:text-gray-400">Keybinds</p>
        <Link href={'/keybindings'}>
          <a
            className="text-gray-800 arrow font-semibold dark:text-gray-200 dark:hover:text-gray-100 hover:text-gray-900 transition"
            rel="noopener noreferrer"
          >
            ↗
          </a>
        </Link>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-opacity-90 mt-8 mb-8 text-xs px-8 text-center">
        Created with &hearts; by{' '}
        <a
          className="custom-underline arrow text-black dark:text-white  font-semibold"
          href="https://github.com/cristicretu/cretu.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cristian Crețu
        </a>
        . Deployed with{' '}
        <a
          className="custom-underline arrow text-black dark:text-white  font-semibold"
          target="_blank"
          rel="noopener noreferrer"
          href="https://vercel.com"
        >
          ▲ Vercel
        </a>
      </p>
    </footer>
  );
};

export default Footer;
