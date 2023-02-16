import type { NextPage } from 'next'

import Container from '@components/Container'
import Footer from '@components/Footer'
import ImagePreview from '@components/ImagePreview'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <Container>
      <main className='flex flex-col items-center space-y-8'>
        <Hero />
        <Footer />
      </main>
    </Container>
  )
}

function Hero() {
  return (
    <div className='flex flex-col gap-8'>
      <div>
        <div className='flex flex-row gap-4'>
          <LayersIcon />
          <CodeIcon />
          <HappyIcon />
        </div>
        <h1 className='text-2xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-400'>
          Cristian Crețu
        </h1>
        <h2 className='text-lg font-medium leading-tight text-gray-600/70 dark:text-gray-500/70'>
          Tinkering with fluid interfaces
        </h2>
      </div>

      <div className='flex flex-col gap-4 leading-normal text-gray-1000/90 dark:text-gray-200/90'>
        <p>
          Hello! I’m a Design Engineer, striving towards unique experiences that
          feel magical and that give a blissful feeling.
        </p>
        <p>
          Unlimitedly obsessed with solving problems where design and
          engineering intersect by creating pixel-perfect, polished interfaces.
        </p>
        <p>
          I’m currently working on various projects and apps. Previously worked
          at{' '}
          <a
            href='https://deta.sh'
            target='_blank'
            rel='noopener noreferrer'
            className='border-b-2 border-[#EA24BE] group hover:border-[#e6b5dc] dark:hover:border-[#713764]'
          >
            <span className='relative group-hover:text-[#EA24BE] transition-all duration-200'>
              Deta
            </span>
          </a>{' '}
          ─ building the personal cloud and ─{' '}
          <a
            href='https://github.com/Landmarks-Tech'
            target='_blank'
            rel='noopener noreferrer'
            className='border-b-2 border-[#248BEA] group hover:border-[#b3cbe0] dark:hover:border-[#304558]'
          >
            <span className='relative group-hover:text-[#248BEA] transition-all duration-200'>
              Landmarks
            </span>
          </a>{' '}
          ─ crafting beautiful web apps. Studying Computer Science.
        </p>
        <p>
          Ardent in reading, writing, and improving consistently through
          learning. Currently interested in C and TypeScript. Experimenting
          native apps with Swift.
        </p>

        <ImagePreview
          src='/static/images/icons/figma.png'
          title='Figma'
          link='https://cretu.lemonsqueezy.com/checkout/buy/5ecc4bf8-ea1b-47a4-aaaf-12f871188660'
        />

        <Link href='/resources'>Explore more resources →</Link>
      </div>
    </div>
  )
}

function HappyIcon() {
  return (
    <svg
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      className='w-8 h-8 text-indigo-500'
    >
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M8.75 4.75H15.25C17.4591 4.75 19.25 6.54086 19.25 8.75V15.25C19.25 17.4591 17.4591 19.25 15.25 19.25H8.75C6.54086 19.25 4.75 17.4591 4.75 15.25V8.75C4.75 6.54086 6.54086 4.75 8.75 4.75Z'
      ></path>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M7.75 12.75C7.75 12.75 9 15.25 12 15.25C15 15.25 16.25 12.75 16.25 12.75'
      ></path>
      <circle cx='14' cy='10' r='1' fill='currentColor'></circle>
      <circle cx='10' cy='10' r='1' fill='currentColor'></circle>
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      className='w-8 h-8 text-indigo-500'
    >
      <rect
        width='14.5'
        height='14.5'
        x='4.75'
        y='4.75'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        rx='2'
      ></rect>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M8.75 10.75L11.25 13L8.75 15.25'
      ></path>
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-8 h-8 text-indigo-500'
    >
      <path
        d='M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.25 12L4.75 15L12 19.25L19.25 15L14.6722 12'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default Home
