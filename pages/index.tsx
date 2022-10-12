import React from 'react'

import { motion } from 'framer-motion'
import type { NextPage } from 'next'
import Image from 'next/image'

import Container from '@components/Container'

const Details = [
  {
    Icon: <AppBadge />,
    children: (
      <p className='text-gray-700 dark:text-gray-100'>
        Design Engineer at <span className='font-bold'>Deta</span>
      </p>
    ),
    subtitle: (
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        Previously at Landmarks
      </p>
    ),
  },
  {
    Icon: <Location />,
    children: (
      <p className='text-gray-700 dark:text-gray-100'>
        Based in <span className='font-bold'>Europe</span>
      </p>
    ),
  },
  {
    Icon: <Star />,
    subtitle: (
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        Check out my{' '}
        <a
          href='https://twitter.com/cristicrtu'
          target='_blank'
          rel='noopener noreferrer'
          className='relative after:absolute after:bg-gray-200 dark:after:bg-gray-500 after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300'
        >
          Twitter ↗
        </a>
      </p>
    ),
    children: (
      <p className='text-gray-700 dark:text-gray-100'>Non-stop prototyping</p>
    ),
  },
]

const Home: NextPage = () => {
  return (
    <Container>
      <header className='flex flex-col items-center space-y-8 select-none '>
        {/* <Card /> */}
        <Hero />
        <Footer />
      </header>
    </Container>
  )
}

function Hero() {
  return (
    <div className='flex flex-col max-w-md gap-8'>
      <div>
        <h1 className='text-2xl text-[#27272A] dark:text-[#D8D8D5] leading-tight font-semibold'>
          Cristian Crețu
        </h1>
        <h2 className='text-lg text-[#A1A1AA] dark:text-[#5E5E55] leading-tight font-medium'>
          Tinkering with fluid interfaces
        </h2>
      </div>

      <div className='flex flex-col gap-4 text-[#71717A] dark:text-[#8E8E85] leading-normal'>
        <p>
          Hello! I’m a Design Engineer, striving towards unique experiences that
          feel magical and that give a blissful feeling.
        </p>
        <p>
          Unlimitedly obsessed with solving problems where design and
          engineering intersect by creating pixel-perfect, polished interfaces.
        </p>
        <p>
          I’m currently working on various projects and on design at{' '}
          <a
            href='https://deta.sh'
            target='_blank'
            rel='noopener noreferrer'
            className='relative inline-block before:absolute group before:bg-[#F016C0] before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.10] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'
          >
            <span className='relative group-hover:text-[#f3f3f4] transition-all duration-500'>
              Deta
            </span>
          </a>
          . I previously worked at{' '}
          <a
            href='https://landmarks.ro'
            target='_blank'
            rel='noopener noreferrer'
            className='relative inline-block before:absolute group before:bg-[#106BF2] before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.10] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'
          >
            <span className='relative group-hover:text-[#f3f3f4] transition-all duration-500'>
              Landmarks
            </span>
          </a>
          . Studying Computer Science.
        </p>
        <p>
          Ardent in reading, writing, and improving consistently through
          learning. Currently interested in C and TypeScript. Curious about
          native apps with Swift.
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className='px-8 py-4 text-xs border-t border-gray-200 border-dashed dark:border-gray-700'>
      <p className='text-center text-gray-400 dark:text-gray-600'>
        Visit{' '}
        <a
          href='https://old.cretu.dev'
          target='_blank'
          rel='noopener noreferrer'
          className='relative after:absolute after:bg-gray-400 dark:after:bg-gray-600 after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300'
        >
          my old website ↗
        </a>
      </p>
    </footer>
  )
}

function Card() {
  return (
    <motion.div
      whileHover={{
        scale: 1.08,
      }}
      whileTap={{
        scale: 0.92,
      }}
      className='flex flex-col items-center max-w-xs p-8 space-y-8 rounded-[29px] bg-gray-10 dark:bg-gray-900 w-fit border-dashed border border-gray-100 dark:border-gray-700'
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
        whileHover={{
          rotate: 360,
          transition: {
            type: 'spring',
            duration: 1,
          },
        }}
        className='relative w-16 h-16'
      >
        <Image
          src='/static/images/logo.png'
          alt='logo'
          className='object-cover rounded-full'
          objectFit='cover'
          layout='fill'
        />
      </motion.div>

      <div className='flex flex-col items-center space-y-2'>
        <h1 className='text-3xl font-bold text-gray-1000 dark:text-gray-10'>
          Cristian Crețu
        </h1>
        <h2 className='text-lg font-semibold text-center text-gray-600 dark:text-gray-300'>
          Developer and designer tinkering with fluid interfaces.
        </h2>
      </div>

      <ul className='flex flex-col space-y-6'>
        {Details.map((detail, index) => (
          <Stat key={index} {...detail} index={index} />
        ))}
      </ul>
    </motion.div>
  )
}

function Stat({
  Icon,
  children,
  subtitle,
  index,
}: {
  Icon?: React.ReactNode
  children: React.ReactNode
  subtitle?: React.ReactNode
  index: number
}) {
  return (
    <motion.li
      variants={{
        hidden: index => ({
          opacity: 0,
          y: -50 * (index + 1),
        }),
        visible: index => ({
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.05 },
        }),
      }}
      initial='hidden'
      animate='visible'
      custom={index}
      key={index}
      className='flex flex-row gap-2'
    >
      {Icon ? Icon : null}

      <div className='flex flex-col -mt-0.5'>
        {children}
        {subtitle ? subtitle : null}
      </div>
    </motion.li>
  )
}

function AppBadge() {
  return (
    <motion.svg
      initial={{ opacity: 0, y: -200 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M14.2031 6.62012C15.7637 6.62012 17.0669 5.3252 17.0669 3.76465C17.0669 2.1958 15.7637 0.90918 14.2031 0.90918C12.6426 0.90918 11.3477 2.1958 11.3477 3.76465C11.3477 5.3252 12.6426 6.62012 14.2031 6.62012ZM0.116699 13.1445C0.116699 14.73 0.299316 15.9004 1.1543 16.7554C2.01758 17.6104 3.18799 17.8013 4.77344 17.8013H11.0737C12.6509 17.8013 13.8296 17.6104 14.6929 16.7554C15.5479 15.8921 15.7305 14.73 15.7305 13.1445V7.60791C15.2988 7.79053 14.8174 7.88184 14.3193 7.87354C14.1699 7.88184 14.0205 7.86523 13.8794 7.84033V13.377C13.8794 14.2485 13.7632 14.9624 13.3398 15.4023C12.9082 15.834 12.1694 15.9502 11.3062 15.9502H4.54102C3.67773 15.9502 2.93896 15.8257 2.50732 15.4023C2.07568 14.9624 1.96777 14.2485 1.96777 13.377V6.67822C1.96777 5.79004 2.07568 5.06787 2.50732 4.63623C2.93896 4.20459 3.67773 4.08838 4.55762 4.08838H10.1191C10.0942 3.93896 10.0859 3.79785 10.0859 3.64844C10.0776 3.15039 10.1772 2.66895 10.3516 2.2373H4.75684C3.19629 2.2373 2.00928 2.42822 1.1543 3.2832C0.299316 4.14648 0.116699 5.30859 0.116699 6.86914V13.1445Z'
        fill='#FF342A'
      />
    </motion.svg>
  )
}

function Star() {
  return (
    <motion.svg
      initial={{
        scale: 0.4,
      }}
      animate={{
        scale: [null, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.2, 1],
      }}
      transition={{
        type: 'spring',
        stiffness: 1000,
        damping: 1,
        delay: 0.2,
      }}
      width='20'
      height='19'
      viewBox='0 0 20 19'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M4.2793 18.1416C4.66943 18.4404 5.15088 18.3408 5.71533 17.9341L10.0317 14.7632L14.3481 17.9341C14.9126 18.3408 15.4023 18.4404 15.7925 18.1416C16.1743 17.8511 16.2573 17.3696 16.0332 16.7139L14.3315 11.6421L18.6895 8.5127C19.2456 8.11426 19.4863 7.67432 19.3286 7.20947C19.1709 6.75293 18.731 6.52881 18.042 6.53711L12.6963 6.57031L11.0693 1.47363C10.8618 0.80957 10.5215 0.452637 10.0317 0.452637C9.55029 0.452637 9.20996 0.80957 8.99414 1.47363L7.36719 6.57031L2.02148 6.53711C1.33252 6.52881 0.900879 6.75293 0.743164 7.20947C0.585449 7.67432 0.817871 8.11426 1.38232 8.5127L5.74023 11.6421L4.03027 16.7139C3.80615 17.3696 3.88916 17.8511 4.2793 18.1416Z'
        fill='#FFC500'
      />
    </motion.svg>
  )
}

function Location() {
  return (
    <motion.svg
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [null, 0, 315, 315, 0, 0],
      }}
      transition={{
        duration: 1.5,
        delay: 0.2,
        ease: 'easeInOut',
        times: [0, 0.2, 0.5, 0.8, 1],
      }}
      width='19'
      height='18'
      viewBox='0 0 19 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M2.83057 9.82861L8.79053 9.84521C8.89014 9.84521 8.90674 9.85352 8.90674 9.96143L8.92334 15.8965C8.92334 17.4404 10.874 17.7808 11.5547 16.3032L17.6475 3.07178C18.3696 1.51123 17.166 0.423828 15.6387 1.12109L2.34912 7.23877C0.971191 7.86963 1.26172 9.82031 2.83057 9.82861Z'
        fill='#006FFF'
      />
    </motion.svg>
  )
}

export default Home
