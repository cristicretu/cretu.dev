import React from 'react'

import { cn } from '@lib/classNames'

export default function Layout({
  className,
  children,
}: {
  children: React.ReactNode
  className?: string
}): JSX.Element {
  return (
    <div className={cn('relative h-full min-h-screen w-full', className ?? '')}>
      {children}
    </div>
  )
}
