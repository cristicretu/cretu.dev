import type { NextPage } from 'next'
import Image from 'next/image'
import { Scroll, Keyframes, SpringConfigs } from 'scrollex'

import Container from '@components/Container'
import endeavours from '@data/endeavours/endeavours'

const mainKeyframes: Record<string, Keyframes> = {
  item: ({ data }) => ({
    [data.index * 150]: {
      opacity: 0,
    },
    [data.index * 150 + 1]: {
      opacity: 1,
    },
  }),
}

const Introduction = [
  'Thinkering with digital art and creating visual interfaces. Experimenting with 3D and CAD modeling.',
  'Interested in C, TypeScript, and Python. Curious about Rust and Swift. Building products using React and Next.js.',
  'Enjoying sports, design, and music. I listen to a lot of lo-fi and electronic songs.',
]
const Home: NextPage = () => {
  return (
    <Container>
      <header className='flex flex-col gap-16'>
        <Scroll.Container scrollAxis='y' className='h-[100vh]'>
          <Scroll.Section showOverflow className='h-[200vh]'>
            <div className='sticky top-0 h-[100vh] flex flex-col overflow-y-hidden'>
              <div className='flex flex-col gap-2 overflow-y-hidden'>
                {Introduction.map((item, index) => (
                  <Scroll.Item
                    key={item}
                    data={{ index }}
                    keyframes={mainKeyframes.item}
                  >
                    <p>{item}</p>
                  </Scroll.Item>
                ))}
              </div>
            </div>
          </Scroll.Section>
        </Scroll.Container>
        <Intro />
        <Endeavours />
      </header>
    </Container>
  )
}

export default Home

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

function Intro() {
  return (
    <div className='flex flex-col space-y-3'>
      <h1 className='font-semibold text-xl'>Cristian Crețu</h1>
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
    </div>
  )
}

function Endeavours() {
  return (
    <div>
      <h2 className='text-lg font-semibold'>Recent endeavours</h2>
      <Scroll.Container scrollAxis='x' throttleAmount={0} className='mt-4'>
        {endeavours.map((endeavor, index) => {
          return (
            <Scroll.Section key={index} className='h-[100vh] mx-4'>
              <div className='h-full inline-flex items-center '>
                <div className='overflow-x-hidden'>
                  <Scroll.Item
                    keyframes={keyframes.image}
                    springs={springs}
                    className='group cursor-pointer'
                  >
                    <div className='relative h-128 w-80'>
                      <div className='absolute bottom-0 w-full h-full transition-all duration-200 bg-gradient-to-t from-gray-100 dark:from-black z-10 opacity-0 group-hover:opacity-90'>
                        <span className='absolute bottom-6 right-1/3 opacity-0 group-hover:opacity-90 text-center font-semibold text-lg'>
                          {endeavor.name}
                        </span>
                        <span className='absolute bottom-2 right-1/3 opacity-0 group-hover:opacity-60 text-center text-sm'>
                          {endeavor.time}
                        </span>
                      </div>
                      <Image
                        src={endeavor.img}
                        layout='fill'
                        className=' transition-all duration-200'
                        alt=''
                        objectFit='cover'
                      />
                    </div>
                  </Scroll.Item>
                </div>
              </div>
            </Scroll.Section>
          )
        })}
      </Scroll.Container>
    </div>
  )
}
