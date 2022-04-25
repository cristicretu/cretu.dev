import React from 'react'

export function Layout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className='relative flex h-full min-h-screen w-full'>
      <div className='flex flex-1'>{children}</div>
    </div>
  )
}
