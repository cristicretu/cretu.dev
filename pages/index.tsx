import type { NextPage } from 'next'

import Container from '@components/Container'
import Parallax from '@components/Parallax'

import Image from 'next/image'

const pics = [
  '/static/images/banner.png',
  '/static/images/banner.png',
  '/static/images/banner.png',
  '/static/images/banner.png',
  '/static/images/banner.png',
  '/static/images/banner.png',
  '/static/images/banner.png',
  '/static/images/banner.png',
]

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
        <div className='flex flex-col gap-4'>
          {pics.map((item, key) => (
            <Parallax key={key}>
              <div className='bg-red-500 rounded-lg p-1'>
                <div className='h-48 w-full relative'>
                  <Image
                    src={item}
                    objectFit='cover'
                    layout='fill'
                    className='rounded-md'
                  />
                </div>
                <div className='p-2'>
                  <p className='font-semibold'>Tesla</p>
                  <p>Made x while acomplishing y, by doing z.</p>
                  <p>Full-stack | Full time</p>
                </div>
              </div>
            </Parallax>
          ))}
        </div>
      </header>
    </Container>
  )
}

export default Home
