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
      <Link href='/'>
        <a className='button-primary-x mx-auto'>Home</a>
      </Link>
    </Container>
  )
}

export default notFound
