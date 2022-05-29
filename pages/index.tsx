import type { NextPage } from 'next'
import Image from 'next/image'

import Container from '@components/Container'
import Parallax from '@components/Parallax'
import { endeavorsList } from '@data/endeavors/endeavors'

const pics = [
  '/static/images/endeavors/streak.png',
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
        <Endeavors />
      </header>
    </Container>
  )
}

const Endeavors = () => {
  return (
    <>
      <div className='flex flex-col gap-4'>
        {endeavorsList.map((item, key) => (
          <Parallax key={key}>
            <div className='cursor-pointer bg-gray-100  hover:bg-gray-200 border-black/10 dark:bg-gray-900 border dark:border-white/10 dark:hover:bg-gray-800 transition-all rounded-lg'>
              <div className='h-72 w-full relative'>
                <Image
                  src={item.img}
                  objectFit='cover'
                  layout='fill'
                  className='rounded-t-md'
                  alt='Summary image'
                />
              </div>
              <div className='p-2 flex flex-col gap-1'>
                <p className='font-semibold text-lg'>{item.title}</p>
                <p className='text-secondary'>{item.description}</p>
                <p className='text-sm text-tertiary'>{item.timeline}</p>
              </div>
            </div>
          </Parallax>
        ))}
      </div>
    </>
  )
}

export default Home
