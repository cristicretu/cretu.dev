import { useState } from 'react'

import Link from 'next/link'

import AudioPlayer from '@components/AudioPlayer'
import BlogPost from '@components/BlogPost'
import Container from '@components/Container'
import ProjectCard from '@components/ProjectCard'
import useAudio from '@lib/useAudio'

export default function Home() {
  const [random] = useState(Math.floor(Math.random() * 4))
  const lofiSong = `/static/audio/lofi_${random}.mp3`
  const electroSong = `/static/audio/electro_${random}.mp3`
  const [url, setUrl] = useState(lofiSong)
  const [playing, setPlaying] = useAudio(url)

  return (
    <Container>
      <div className='w-full'>
        <div className='flex flex-col md:grid grid-cols-3 grid-rows-1 gap-y-16 md:gap-y-28 gap-x-4 text-gray-700 dark:text-gray-300'>
          {/* hero */}
          <div className='col-span-3'>
            <div className='flex flex-row gap-2 items-center'>
              <p className='font-semibold text-xl'>Cristian Crețu</p>
              <div className='flex-grow border-t'></div>
            </div>
            <h1 className='text-3xl font-serif tracking-wide'>
              <span>
                Developer and designer making the web feel &apos;right&apos; and
                faster.{' '}
              </span>
              <span className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all'>
                Focused on creating fluid and accessible interfaces.
              </span>
            </h1>
          </div>

          {/* about */}
          <div className='col-span-2 flex flex-col gap-4'>
            <p className='text-2xl font-serif hover:text-gray-900 dark:hover:text-gray-100 transition-all'>
              About
            </p>
            <div className='flex flex-col gap-2'>
              <p>
                {' '}
                <mark className='bg-yellow-100 dark:bg-yellow-200 '>
                  Thinkering with digital art and creating visual interfaces.
                </mark>
              </p>
              <p>
                Interested in C, TypeScript, and Python. Curious about Rust and
                Swift. Building products using React, Next.js, and GraphQL.
              </p>
              <p>
                Enjoying sports, design, and music. I listen to a lot of{' '}
                <span
                  onClick={() => {
                    if (url !== lofiSong && playing) {
                      setUrl(lofiSong)
                    } else if (url !== lofiSong && !playing) {
                      setUrl(lofiSong)
                      setPlaying(true)
                    }
                  }}
                >
                  <AudioPlayer
                    playing={playing}
                    setPlaying={setPlaying}
                    title='lo-fi'
                    url={url}
                  />
                </span>{' '}
                and{' '}
                <span
                  onClick={() => {
                    if (url !== electroSong && playing) {
                      setUrl(electroSong)
                    } else if (url !== electroSong && !playing) {
                      setUrl(electroSong)
                      setPlaying(true)
                    }
                  }}
                >
                  {' '}
                  <AudioPlayer
                    playing={playing}
                    setPlaying={setPlaying}
                    title='electronic'
                    url={url}
                  />
                </span>{' '}
                songs.
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <p className='text-2xl font-serif transition duration-200 ease-in-out hover:text-gray-900 group dark:hover:text-gray-200'>
              Projects
            </p>
            <div className='flex flex-col gap-2 -mt-2'>
              <ProjectCard
                title='Keep The Streak'
                github='https://github.com/cristicretu/keep-the-streak'
                url='https://github.com/cristicretu/keep-the-streak'
                description={`GitHub Action that notifies the user when he hasn't committed on a particular day.`}
              />
              <ProjectCard
                title='Ultimate Template'
                github='https://github.com/cristicretu/ts-next-tailwind-template'
                description='Complex Front-end Template for Next.js, TailwindCSS, and TypeScript.'
                url='https://template.cretu.dev'
              />
              <span className='font-serif cursor-wait'>More...</span>
            </div>
          </div>

          {/* writing */}
          <div className='col-span-2 flex flex-col gap-4'>
            <Link href='/writing'>
              <a className='text-2xl font-serif transition duration-200 ease-in-out cursor-pointer hover:text-gray-900 group dark:hover:text-gray-300'>
                Writing{' '}
                <span
                  aria-hidden='true'
                  className='inline-block transition-transform duration-200 ease-in-out translate-x-0 group-hover:translate-x-1'
                >
                  →
                </span>
              </a>
            </Link>
            <div className='flex flex-col gap-4'>
              <BlogPost
                summary='My thoughts on 2021'
                title='2021 in Review'
                slug='2021'
                type='small'
                variant='index'
              />
              <BlogPost
                summary='A roadmap for everyone to learn more about the web.'
                title='Learning Web Development'
                slug='learning-web-dev'
                type='small'
                variant='index'
              />
              <BlogPost
                summary='Short tutorial explaining how to create good-looking gradients.'
                title='Making Gradients'
                slug='gradient-wallpapers'
                type='small'
                variant='index'
              />
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <p className='text-2xl font-serif transition duration-200 ease-in-out hover:text-gray-900 group dark:hover:text-gray-200'>
              Building
            </p>
            <div className='flex flex-col gap-4'>
              <ProjectCard
                title='⌘ K Menu'
                description='A menu for quick access to the site. Press ⌘ + K here.'
              />
              <ProjectCard
                title='lds'
                description='An opinionated, minimal, and accessible design system.'
              />
              <ProjectCard
                title='Inspo. 🚧'
                description='A collection of components providing inspiration for designers and developers.'
                github='https://github.com/cristicretu/inspo'
                url='https://inspo.cretu.dev'
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
