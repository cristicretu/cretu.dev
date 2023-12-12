'use client';

import { getRelativeTimeString } from '@/lib/relativeDate';
import React from 'react';

const DateViewer = ({ date }: { date: string }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span className="font-mono text-sm uppercase">
      {mounted && getRelativeTimeString(new Date(date))}
    </span>
  );
};

export default DateViewer;
