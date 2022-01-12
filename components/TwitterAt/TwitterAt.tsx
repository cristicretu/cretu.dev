import React from 'react';

interface TwitterAtProps {
  handle: string;
}

export default function TwitterAt({ handle }: TwitterAtProps): JSX.Element {
  return (
    <a
      href={`https://twitter.com/${handle}`}
      className="text-blue-500 hover:text-blue-600"
      target="_blank"
      rel="noopener noreferrer"
    >
      @{handle}
    </a>
  );
}
