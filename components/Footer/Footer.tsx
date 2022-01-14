import ExternalLink from '@components/ExternalLink';
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
    <div className="flex flex-col justify-center mt-8 mb-2 text-gray-800 dark:text-gray-300 delayed">
      <hr
        className={cx(
          'w-full border-1 border-gray-200 dark:border-gray-800 before',
          rendered ? 'after' : ''
        )}
        style={{ transitionDelay: '450ms' }}
      />
      <div
        className={cx(
          'font-serif flex flex-row justify-between text-opacity-70 mt-2 dark:text-opacity-70 text-lg text-gray-700 dark:text-gray-300 before',
          rendered ? 'after' : ''
        )}
        style={{ transitionDelay: '500ms' }}
      >
        <p>{new Date().getFullYear()} - Prioritize yourself.</p>
        <p>
          Made with delight by{' '}
          <ExternalLink href="https://twitter.com/cristicrtu">
            Cristian Crețu.
          </ExternalLink>
        </p>
      </div>
    </div>
  );
}
