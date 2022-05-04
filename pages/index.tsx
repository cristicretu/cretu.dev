import type { NextPage } from 'next'
import Image from 'next/image'
import { Scroll, Keyframes, SpringConfigs } from 'scrollex'

import Container from '@components/Container'
import endeavours from '@data/endeavours/endeavours'

const keyframes: Record<string, Keyframes> = {
  image: ({ section, container }) => ({
    [section.rightAt('container-right') - container.width]: {
      translateX: -100,
    },
    [section.leftAt('container-left') + container.width]: {
      translateX: 100,
    },
  }),
}

const springs: SpringConfigs = {
  translateX: {
    mass: 0.01,
    stiffness: 200,
    damping: 5,
  },
}

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
        <div>
          <h2>Recent endeavours</h2>
          <Scroll.Container scrollAxis='x' throttleAmount={0} className='mt-4'>
            {endeavours.map((endeavor, index) => {
              return (
                <Scroll.Section key={index} className='h-[100vh] mx-4'>
                  <div className='h-full inline-flex items-center '>
                    <div className='overflow-hidden'>
                      <Scroll.Item
                        keyframes={keyframes.image}
                        springs={springs}
                      >
                        <div className='relative h-128 w-80'>
                          <Image
                            src={endeavor.img}
                            layout='fill'
                            className='opacity-50 hover:opacity-100 transition-all duration-200'
                            alt=''
                            objectFit='cover'
                          />
                        </div>
                        <span>{endeavor.name}</span>
                      </Scroll.Item>
                    </div>
                  </div>
                </Scroll.Section>
              )
            })}
          </Scroll.Container>
        </div>
      </header>
    </Container>
  )
}

export default Home
