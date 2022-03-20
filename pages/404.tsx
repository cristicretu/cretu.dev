import React from 'react'

import Link from 'next/link'

import Container from 'components/Container/Container'

export default function NotFound() {
  return (
    <Container title={'Cristian Crețu - 404'}>
      <div className='flex flex-col items-start justify-center max-w-2xl mx-auto my-2 mb-16 sm:my-4 md:my-8'>
        <h1 className='mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white'>
          404 - Not Found
        </h1>
        <div className='flex flex-col space-y-12'>
          <p className='text-gray-600 dark:text-gray-400'>
            Oops! Seems that you&lsquo;ve entered
            <a className='italic'> the dark side</a>. You found something that
            used to exist, or you typed something wrong. Try that URL again, or
            👇
          </p>
          <Link href='/'>
            <a className='px-12 py-4 mx-auto text-lg font-bold text-gray-900 bg-gray-100 rounded-md dark:text-gray-100 dark:bg-gray-800'>
              Return home
            </a>
          </Link>
        </div>
      </div>
    </Container>
  )
}
