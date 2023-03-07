import { Suspense } from 'react'

import { format, parseISO } from 'date-fns'
import Image from 'next/image'

import Container from '@components/Container'
import ExternalLink from '@components/ExternalLink'
import { Writing } from 'contentlayer/generated'

interface IWritingLayoutProps {
  children: React.ReactNode
  post: Writing
}

const editUrl = (slug: string) =>
  `https://github.com/cristicretu/cretu.dev/edit/main/data/writing/${slug}.mdx`

export default function WritingLayout({ post, children }: IWritingLayoutProps) {
  return (
    <Container
      writingNav={post.slug}
      footer
      title={`${post.title} - Cristian Crețu`}
      description={post.summary}
      image={`https://cretu.dev/${post.image}`}
      date={new Date(post.publishedAt).toISOString()}
      type='article'
      back={{
        href: '/writing',
        label: 'Writing',
      }}
      page='writing'
    >
      <article className='flex flex-col items-start justify-center w-full max-w-2xl mx-auto sm:px-4'>
        <div className='flex flex-col justify-center items-center gap-2 mx-auto h-[60vh]'>
          <p className='text-secondary'>Cristian Crețu</p>
          <div className='text-sm flex flex-row gap-2 divide-x divide-gray-300 dark:divide-gray-700 items-center text-secondary rounded-full border border-black/50 dark:border-white/50 px-2.5 py-2'>
            <p className='pl-2'>
              {format(parseISO(post.publishedAt), 'MMMM dd, yyyy')}
            </p>
            <p className='pl-2 text-sm text-tertiary min-w-32'>
              {post.readingTime.text}
            </p>
          </div>
          <h1 className='mb-4 text-3xl font-bold font-serif tracking-tight text-center text-black md:text-5xl dark:text-white'>
            {post.title}
          </h1>
          <p className='text-secondary text-center'>{post.summary}</p>
        </div>
        {post.image && (
          <div className='relative w-full h-96 mt-36'>
            <Image
              src={post.image}
              layout='fill'
              objectFit='cover'
              alt={`${post.title}`}
              className='rounded-lg'
            ></Image>
          </div>
        )}

        <Suspense fallback={null}>
          <div className='w-full my-4 prose dark:prose-dark max-w-2xl'>
            {children}
          </div>
          <div className='button-primary-x'>
            <ExternalLink arrow={true} href={editUrl(post.slug)}>
              Edit source on GitHub
            </ExternalLink>
          </div>
        </Suspense>
      </article>
    </Container>
  )
}
