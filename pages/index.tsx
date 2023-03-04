import { useState } from 'react'

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
      <main className=' flex flex-col items-center space-y-8 relative w-full'>
        <div className='mt-48 flex flex-col items-center text-4xl gap-8'>
          <Title />
          <p>This is some content to be folded and peeled away.</p>
          <p>This is some content to be folded and peeled away.</p>
          <p>This is some content to be folded and peeled away.</p>
          <p>This is some content to be folded and peeled away.</p>
          <p>This is some content to be folded and peeled away.</p>
        </div>
        <div className=' bg-white/70 dark:bg-black/70 backdrop-blur-md absolute p-[1000px] !-mt-40 w-[1000px]' />
        <div className='absolute'>
          <div className='z-10 absolute'>
            <PeelCard />
          </div>
          <div className='w-[300px] h-[450px] bg-white dark:bg-black blur-xl'></div>
        </div>
      </main>
    </Container>
  )
}

export default Home
