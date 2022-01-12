import React from 'react';
import useDelayedRender from 'use-delayed-render';

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Footer(): JSX.Element {
  const { mounted, rendered } = useDelayedRender(true, {
    exitDelay: 2000
  });

  return (
    <div className="flex flex-col justify-center mt-4 space-y-3 text-gray-800 dark:text-gray-300 delayed">
      <hr
        className={cx(
          'w-full border-1 border-gray-200 dark:border-gray-800 mb-4 before',
          rendered ? 'after' : ''
        )}
        style={{ transitionDelay: '450ms' }}
      />
      <p
        className={cx(
          'mx-auto text-sm text-gray-700 dark:text-gray-300 before',
          rendered ? 'after' : ''
        )}
        style={{ transitionDelay: '500ms' }}
      >
        Created with &hearts; by{' '}
        <a
          className="custom-underline group"
          target="_blank"
          rel="noopener noreferrer"
          href="https://twitter.com/cristicrtu"
        >
          Cristian Crețu
        </a>
        <span className="transition cursor-arrow translate group-hover:translate-y-1">
          &#8599;
        </span>
        .{'  '}
        Deployed with{' '}
        <a
          className="custom-underline group"
          target="_blank"
          rel="noopener noreferrer"
          href="https://vercel.com"
        >
          Vercel
        </a>
        <span className="transition cursor-arrow translate group-hover:translate-y-1">
          &#8599;
        </span>
        .
      </p>
    </div>
  );
}
