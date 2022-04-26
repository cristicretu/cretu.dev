import React from 'react'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return <div className='relative h-full min-h-screen w-full'>{children}</div>
}
