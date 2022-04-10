import { useState } from 'react'

import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

import BlogPost from '@components/BlogPost'
import Container from '@components/Container'
import { getAllFilesFrontMatter } from 'lib/mdx'

interface writingProps {
  posts
}

export default function Writing({ posts }: writingProps): JSX.Element {
  const [Results, setResults] = useState('')
  const SearchResults = posts
    .sort(
      (a, b) =>
        Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt))
    )
    .filter(date => date.title.toLowerCase().includes(Results.toLowerCase()))

  return (
    <Container
      title='Cristian Crețu - Writing'
      description='My ideas about programming, tech, and personal life.'
    >
      <div className='flex flex-col space-y-4 text-gray-700 dark:text-gray-300'>
        <div className=' flex flex-col space-y-4'>
          <Link href='/'>
            <a className='text-gray-500 transition duration-200 ease-in-out cursor-pointer hover:text-gray-700 group dark:text-gray-400 dark:hover:text-gray-200'>
              <span
                aria-hidden='true'
                className='inline-block transition-transform duration-200 ease-in-out translate-x-0 group-hover:-translate-x-1'
              >
                ←
              </span>{' '}
              Index
            </a>
          </Link>
          <h1 className='font-serif text-4xl font-bold text-gray-900 dark:text-gray-100'>
            Writing
          </h1>
          <p>
            This is the place where I share my ideas about programming, tech,
            and other things from my life. Use the search box bellow to filter
            posts.
          </p>
        </div>
        <div className='relative w-full space-x-2 flex px-4 py-2 items-center font-bold text-lg rounded-md text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800'>
          <MagnifyingGlassIcon className='w-5 h-5 fill-current' />
          <input
            value={Results}
            className='flex-grow block w-full bg-transparent outline-none rounded-xs'
            aria-label='Search articles'
            type='text'
            onChange={e => setResults(e.target.value)}
            placeholder='Search Articles'
          />
        </div>

        {!SearchResults.length && <p>No results found.</p>}
        <div className='flex flex-col space-y-2 '>
          {SearchResults.map(data => (
            <BlogPost
              key={data.title}
              title={data.title}
              summary={data.summary}
              slug={data.slug}
              date={data.publishedAt}
              variant='writing'
            />
          ))}
        </div>
      </div>
    </Container>
  )
}

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')

  return {
    props: { posts },
  }
}
