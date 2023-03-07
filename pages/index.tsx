import { useRef, useState } from 'react'

import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
} from 'framer-motion'
import type { NextPage } from 'next'
import Link from 'next/link'

import Container from '@components/Container'
import Footer from '@components/Footer'
import { Title } from '@components/Icons'
import ImagePreview from '@components/ImagePreview'
import { PeelCard } from '@components/PeelCard'

const Home: NextPage = () => {
  return (
    <Container>
      <div className=' flex flex-col items-center space-y-8  relative'>
        <div className='my-12 md:my-24 lg:my-48 flex flex-col items-center text-4xl gap-8'>
          {/* <Title /> */}
          <>
            <h3 className='text-5xl  md:text-8xl font-bold '>
              Sculpting fluid interfaces.
            </h3>
            <h3 className='text-5xl md:text-8xl absolute font-bold clip-text'>
              Sculpting fluid interfaces.
            </h3>
          </>

          <p>
            Unlimitedly obsessed with solving problems where design and
            engineering intersect by creating pixel-perfect, polished
            interfaces.
          </p>
          <p>
            I’m currently working on various projects and apps. Previously
            worked at Deta ─ building the personal cloud and ─ Landmarks ─
            crafting beautiful web apps. Studying Computer Science.
          </p>
          <p>
            Ardent in reading, writing, and improving consistently through
            learning. Currently interested in C and TypeScript. Experimenting
            native apps with Swift.
          </p>
        </div>
        {/* <div className='absolute'>
          <div className='z-10 absolute'>
            <PeelCard />
          </div>
          <div className='w-[300px] h-[450px] bg-white dark:bg-black blur-xl'></div>
        </div> */}
        <Footer />
      </div>
    </Container>
  )
}

export default Home
