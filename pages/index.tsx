import type { NextPage } from 'next'
import Image from 'next/image'

import Container from '@components/Container'
import Parallax from '@components/Parallax'
import { endeavorsList } from '@data/endeavors/endeavors'
import Endeavors from '@components/Endeavors'

const Home: NextPage = () => {
  return (
    <Container>
      <header className='flex flex-col gap-3'>
        <h1 className='font-semibold'>Cristian Crețu</h1>
        <p>
          Developer and designer making products that feel &apos;right&apos; and
          faster.{' '}
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
        <p>
          Enjoying sports, design, and music. I listen to a lot of lo-fi and
          electronic songs.
        </p>
        <h2 className='font-semibold'>Recent endeavors</h2>
        <Endeavors />
      </header>
    </Container>
  )
}

export default Home
