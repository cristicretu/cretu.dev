import Link from 'next/link'

import Container from '@components/Container'

const notFound = () => {
  return (
    <Container footer={false}>
      <h1>404 - Page not found.</h1>
      <p className=''>
        Maybe you misspelled the link. Maybe something existed here, or it
        didn&apos;t exist in the first place...
      </p>
      <Link href='/'>
        <a className='button-primary mx-auto'>Home</a>
      </Link>
    </Container>
  )
}

export default notFound
