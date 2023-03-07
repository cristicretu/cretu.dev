import { useEffect, useMemo, useState } from 'react'

import { pick } from 'contentlayer/client'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'

import { allWritings, Writing } from '.contentlayer/generated'
import Container from '@components/Container'
import Footer from '@components/Footer'
import { PeelCard } from '@components/PeelCard'
import { cn } from '@lib/classNames'

const Home = ({ posts }: { posts: Writing[] }) => {
  const [cardPeeled, setCardPeeled] = useState(true)

  const memoizedPosts = useMemo(() => {
    return posts
      .slice(0, 4)
      .map(post => pick(post, ['slug', 'title', 'summary', 'publishedAt']))
      .sort(
        (a, b) =>
          Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt))
      )
  }, [posts])

  const clickHandler = () => {
    setCardPeeled(false)
  }

  return (
    <Container>
      <div className=' flex flex-col items-center space-y-8  relative'>
        <div
          className={cn(
            'my-12 md:my-24 flex flex-col items-center text-4xl gap-8',
            cardPeeled ? 'blur-md' : ''
          )}
        >
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
            worked at{' '}
            <a
              href='https://deta.space'
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
        </div>
        <AnimatePresence>
          {cardPeeled && (
            <motion.div
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -500, y: -100 }}
              transition={{ duration: 0.5, easings: 'easeInOut' }}
              className='absolute'
            >
              <div
                className='z-10 absolute cursor-pointer'
                onClick={clickHandler}
              >
                <PeelCard />
              </div>
              <div className='w-[300px] h-[400px] bg-white dark:bg-black blur-md'></div>
            </motion.div>
          )}
        </AnimatePresence>
        {!cardPeeled && (
          <>
            <div className='max-w-2xl pb-24'>
              <h1 className='font-bold text-3xl font-serif tracking-tight'>
                Recent writing
              </h1>
              <div className='columns-1 md:columns-2 gap-8'>
                {memoizedPosts.map((post, index) => (
                  <Link
                    key={index}
                    href={`/writing/${post.slug}`}
                    className={cn(
                      'flex flex-col py-2 px-2 -mx-2 rounded-md my-2',
                      'hover:bg-gray-200 dark:hover:bg-gray-800',
                      'transition-all duration-200'
                    )}
                  >
                    <span className='flex-grow truncate mr-2'>
                      {post.title}
                    </span>
                    <span className='text-tertiary flex-shrink-0'>
                      {post.summary}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <Footer />
          </>
        )}
      </div>
    </Container>
  )
}

export function getStaticProps() {
  const posts = allWritings
    .map(post => pick(post, ['slug', 'title', 'summary', 'publishedAt']))
    .sort(
      (a, b) =>
        Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt))
    )

  return {
    props: {
      posts,
    },
  }
}

export default Home
