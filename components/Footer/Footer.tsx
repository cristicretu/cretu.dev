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
          'mx-auto font-serif text-gray-700 dark:text-gray-300 before',
          rendered ? 'after' : ''
        )}
        style={{ transitionDelay: '500ms' }}
      >
        Prioritize yourself.
      </p>
    </div>
  );
}
