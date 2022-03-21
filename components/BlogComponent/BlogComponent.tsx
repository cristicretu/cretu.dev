import React from 'react'

import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

import ExternalLink from '@components/ExternalLink'
import { IMeta } from '@lib/types'

import Container from '../Container/Container'

interface BlogComponentProps {
  children?: React.ReactNode
  frontMatter?: IMeta
}

const editUrl = slug =>
  `https://github.com/cristicretu/cretu.dev/edit/main/data/blog/${slug}.mdx`

export default function BlogComponent({
  children,
  frontMatter,
}: BlogComponentProps): JSX.Element {
  return (
    <Container
      title={`Cristian Crețu - ${frontMatter.title}`}
      description={frontMatter.summary}
      image={`https://cretu.dev${frontMatter.image}`}
      date={new Date(frontMatter.publishedAt).toString()}
      type='article'
    >
      <div className='py-16'>
        <Link href='/writing'>
          <a className='text-gray-500 transition duration-200 ease-in-out cursor-pointer hover:text-gray-700 group dark:text-gray-400 dark:hover:text-gray-200'>
            <span
              aria-hidden='true'
              className='inline-block transition-transform duration-200 ease-in-out translate-x-0 group-hover:-translate-x-1'
            >
              ←
            </span>{' '}
            Back
          </a>
        </Link>
        <article className='flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb'>
          <h1 className='mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white'>
            {frontMatter.title}
          </h1>
          <div className='flex flex-col items-start justify-between w-full mt-2 md:flex-row md:items-center'>
            <div className='flex items-center'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                Cristian Crețu
                {` • `}
                {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
                {` • `}
                {frontMatter.readingTime.text}
              </p>
            </div>
          </div>
          <br></br>
          {frontMatter.image && (
            <div className='relative w-full h-96'>
              <Image
                src={frontMatter.image}
                layout='fill'
                objectFit='cover'
                alt='blog-image'
                className='rounded-lg'
              ></Image>
            </div>
          )}

          <div className='w-full mt-4 prose dark:prose-dark max-w-none'>
            {children}
          </div>
          <div className='mt-2 text-gray-700 dark:text-gray-300'>
            <ExternalLink href={editUrl(frontMatter.slug)}>
              Edit source on GitHub
            </ExternalLink>
          </div>
        </article>
      </div>
    </Container>
  )
}
