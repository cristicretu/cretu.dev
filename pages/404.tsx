import Link from 'next/link'

import Container from '@components/Container'

const notFound = () => {
  return (
    <Container footer={false}>
      <h1 className='text-xl font-semibold'>404 - Page not found.</h1>
      <p className='text-secondary'>
        Maybe you misspelled the link. Maybe something existed here, or it
        didn&apos;t exist in the first place...
      </p>
      <Link href='/' className='mx-auto button-primary-x w-fit'>
        Home
      </Link>
    </Container>
  )
}

export default notFound
