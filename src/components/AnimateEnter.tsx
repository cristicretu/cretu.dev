'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AnimateEnter({ children }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <m.main
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mx-auto p-4"
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {children}
      </m.main>
    </LazyMotion>
  );
}
