import Container from 'components/Container';
import Link from 'next/link';
import React from 'react'

const NotFound: React.FC<{}> = ({ }) => {
  return (
    <Container title={"Cristian Crețu - 404"}>
      <div className='flex flex-col items-center text-gray-900 dark:text-gray-100 space-y-3'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p>Page not found</p>
      <Link href="/">
        <a className='px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800'>Return Home</a>
      </Link>
      </div>
    </Container>);
}

export default NotFound