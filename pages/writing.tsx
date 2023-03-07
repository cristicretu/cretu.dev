import { pick } from 'contentlayer/client'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

import { allWritings } from '.contentlayer/generated'
import Container from '@components/Container'
import { cn } from '@lib/classNames'
import type { Writing } from 'contentlayer/generated'

const WritingPage = ({ posts }: { posts: Writing[] }) => {
  return (
    <Container
      footer
      back={{
        href: '/',
        label: 'Index',
      }}
      className='max-w-xl'
    >
      <h1 className='font-bold text-3xl font-serif'>Writing</h1>
      {posts.map((post, index) => (
        <Link
          key={post.slug}
          href={`/writing/${post.slug}`}
          className={cn(
            'flex flex-row justify-between py-2 px-2 -mx-2 rounded-md',
            'hover:bg-gray-200 dark:hover:bg-gray-800',
            'transition-all duration-200'
          )}
        >
          <span className='text-quaternary pr-4 '>
            {posts.length - index > 10
              ? posts.length - index
              : `0${posts.length - index}`}
          </span>
          <span className='flex-grow truncate mr-2'>{post.title}</span>
          <span className='text-tertiary flex-shrink-0'>
            {format(parseISO(post.publishedAt), 'MMMM dd, yyyy')}
          </span>
        </Link>
      ))}
    </Container>
  )
}

export default WritingPage

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
