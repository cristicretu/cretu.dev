import type { NextPage } from 'next'

import Container from '@components/Container'
import ExternalLink from '@components/ExternalLink'

const Home: NextPage = () => {
  return (
    <Container>
      <header className='flex flex-col gap-3'>
        <h1 className='font-semibold'>Cristian Crețu</h1>
        <p>
          Developer and designer making products that feel &apos;right&apos; and
          faster.
          <span className='text-secondary'>
            Focused on creating fluid and accessible interfaces.
          </span>
        </p>
        <p>
          Thinkering with digital art and creating visual interfaces.
          Experimenting with 3D and CAD modeling.
        </p>
        <p>
          Interested in C, TypeScript, and Python. Curious about Rust and Swift.
          Building products using React and Next.js.
        </p>
        <ExternalLink href='https://cretu.dev'>Google</ExternalLink>
        <p>
          Enjoying sports, design, and music. I listen to a lot of lo-fi and
          electronic songs.
        </p>
      </header>
    </Container>
  )
}

export default Home
