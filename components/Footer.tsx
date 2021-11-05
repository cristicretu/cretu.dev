import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col justify-center items-center max-w-2xl mx-auto w-full  px-2 sm:px-2 md:px-0 mb-8">
      <hr className="w-full border-1 border-gray-200 dark:border-gray-800 mb-8" />
      <div className="  max-w-2xl mx-auto flex flex-row flex-grow  space-x-4 items-center ">
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
      <p className="text-gray-700 dark:text-gray-300 text-opacity-90 mt-8 text-xs px-8 text-center">
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
