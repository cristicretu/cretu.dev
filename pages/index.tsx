import type { NextPage } from 'next'
import Image from 'next/image'

import Container from '@components/Container'
import Endeavors from '@components/Endeavors'

const Home: NextPage = () => {
  return (
    <Container>
      <header className='flex flex-col gap-6'>
        <div className='flex gap-4 items-center'>
          <div className='relative h-10 w-10'>
            <Image
              src='/static/images/logo.png'
              alt='logo'
              className='absolute inset-0 object-cover rounded-full'
              objectFit='cover'
              layout='fill'
            />
          </div>
          <h1 className='font-semibold text-lg'>Cristian Crețu</h1>
        </div>
        <div className='flex flex-col gap-2 text-secondary'>
          <p>
            Developer and designer making products that feel &apos;right&apos;
            and faster.{' '}
            <span className='text-secondary'>
              Focused on creating fluid and accessible interfaces.
            </span>
          </p>
          <p>
            Thinkering with digital art and creating visual interfaces.
            Experimenting with 3D and CAD modeling.
          </p>
          <p>
            Interested in C, TypeScript, and Python. Curious about Rust and
            Swift. Building products using React and Next.js.
          </p>
          <p>
            Enjoying sports, design, and music. I listen to a lot of lo-fi and
            electronic songs.
          </p>
        </div>
        <h2 className='font-semibold text-lg'>Recent endeavors</h2>
        <Endeavors />
      </header>
    </Container>
  )
}

export default Home
