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
    <footer className="mx-auto mt-4 space-y-3 text-center text-gray-800 myfooter dark:text-gray-300 delayed">
      <hr
        className={cx(
          'w-full border-1 border-gray-200 dark:border-gray-800  max-w-lg mx-auto before',
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
    </footer>
  );
}
