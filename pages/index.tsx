import { useEffect, useState } from 'react'

import Image from 'next/image'
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
        <div className='flex flex-col space-y-4 text-gray-600 dark:text-gray-400'>
          <div className='flex items-center mb-2 space-x-4 delayed'>
            <div className='flex  items-center space-x-4'>
              <div className='relative w-16 h-16'>
                <Image
                  src='/static/images/favicon.webp'
                  layout='fill'
                  objectFit='cover'
                  alt='Profile Picture'
                  className='rounded-full'
                />
              </div>

              <div>
                <h1 className='text-2xl font-bold tracking-tight text-black dark:text-white'>
                  Cristian Crețu
                </h1>

                <p className='text-md'>Developer and designer</p>
              </div>
            </div>
          </div>

          <div className='flex flex-col space-y-2 '>
            <p>
              <span className='font-serif text-lg italic'>
                Making the web feel &apos;right&apos; and faster.
              </span>{' '}
              Creating full-stack applications - focusing on performance and
              usability. Thinkering with digital art and creating visual
              interfaces. Student and side-project hustler.
            </p>
          </div>

          <div className='flex flex-col space-y-2 '>
            <p>
              Learning about performant, accessible, and beautiful web
              components and apps.
            </p>
            <p>
              Interested in C, TypeScript, and Python. Curious about Rust and
              Swift. Building web applications using ReactJs, NextJs for
              interfaces, and Node.js with GraphQL for the back-end.
            </p>
          </div>

          <div className='flex flex-row space-x-1 items-center'>
            <p>Enjoying sports, design, and music. I listen to a lot of</p>
            <div
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
            </div>
            <p>and</p>
            <div
              onClick={() => {
                if (url !== electroSong && playing) {
                  setUrl(electroSong)
                } else if (url !== electroSong && !playing) {
                  setUrl(electroSong)
                  setPlaying(true)
                }
              }}
            >
              <AudioPlayer
                playing={playing}
                setPlaying={setPlaying}
                title='electronic'
                url={url}
              />
            </div>
            <p>songs.</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2  gap-5'>
            <div className='flex flex-col mt-4 space-y-4 md:mt-8'>
              <p>Building</p>
              <ProjectCard
                title='⌘K Menu'
                description='A menu for quick access to the site. Press ⌘ + K here.'
              />
              <ProjectCard
                title='lds'
                description='An opinionated, minimal, and accessible design system.'
              />
              <ProjectCard
                title='Ultimate Template'
                description='A full-fledged front-end template for building your own apps.'
                type='small'
                github='https://github.com/cristicretu/ts-next-tailwind-template'
                url='https://template.cretu.dev'
              />
              <ProjectCard
                title='Inspo. 🚧'
                description='A collection of components providing inspiration for designers and developers.'
                type='small'
                github='https://github.com/cristicretu/inspo'
                url='https://inspo.cretu.dev'
              />
              <ProjectCard
                title='Covid Tracker'
                description='A simple, responsive, and accessible Covid Tracker.'
                type='small'
                github='https://github.com/cristicretu/rocovidtracker'
                url='https://covid.cretu.dev'
              />
            </div>

            <div className='flex flex-col mt-4 space-y-4 md:mt-8'>
              <Link href='/writing'>
                <a className='text-gray-500 transition duration-200 ease-in-out cursor-pointer hover:text-gray-700 group dark:text-gray-400 dark:hover:text-gray-200'>
                  Writing{' '}
                  <span
                    aria-hidden='true'
                    className='inline-block transition-transform duration-200 ease-in-out translate-x-0 group-hover:translate-x-1'
                  >
                    →
                  </span>
                </a>
              </Link>
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
        </div>
      </div>
    </Container>
  )
}
