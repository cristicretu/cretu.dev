import React from 'react';

interface TwitterAtProps {
  handle: string;
}

const TwitterAt: React.FC<TwitterAtProps> = ({ handle }) => {
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
};

export default TwitterAt;
