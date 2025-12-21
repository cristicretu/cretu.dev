'use client';

import { getRelativeTimeString } from '@/lib/relativeDate';
import { useEffect, useState } from 'react';

interface Props {
  date: string;
}

export default function DateViewer({ date }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span className="font-mono text-sm uppercase">
      {mounted && getRelativeTimeString(new Date(date))}
    </span>
  );
}
