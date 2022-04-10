import React from 'react'

import { format, parseISO } from 'date-fns'
import Link from 'next/link'

import { classNames } from '@lib/classNames'

interface BlogPostProps {
  title: string
  summary: string
  slug: string
  type?: string
  date?: string
  variant: 'writing' | 'index'
}

export default function BlogPost({
  title,
  summary,
  slug,
  type,
  date,
  variant,
}: BlogPostProps): JSX.Element {
  if (variant === 'index') {
    return (
      <Link href={`/writing/${slug}`}>
        <a className='flex items-center w-full space-x-2 rounded-md -ml-2 px-2 py-2 ransition-colors duration-200 cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-800'>
          <div className='flex flex-col space-y-1'>
            <div className='flex justify-between'>
              <p
                className={classNames(
                  'font-serif text-black dark:text-white',
                  type === 'small' ? 'text-md' : 'text-lg'
                )}
              >
                {title}
              </p>
            </div>
            <p className='max-w-2xl'>{summary}</p>
          </div>
        </a>
      </Link>
    )
  }
  return (
    <Link href={`/writing/${slug}`}>
      <a className='flex items-center py-6 space-x-2 transition-colors duration-200 rounded-md cursor-pointer group hover:bg-gray-200 dark:hover:bg-gray-800'>
        <aside className=' [writing-mode:vertical-rl] pl-2 top-0 text-center text-sm text-gray-400 dark:text-gray-600'>
          {format(parseISO(date), 'MMMM dd')}
        </aside>
        <div className='flex items-center w-full space-x-2 rounded-md '>
          <div className='flex flex-col space-y-1'>
            <div className='flex justify-between'>
              <p
                className={classNames(
                  'font-serif font-bold text-black dark:text-white',
                  type === 'small' ? 'text-md' : 'text-lg'
                )}
              >
                {title}
              </p>
            </div>
            <p className='max-w-2xl'>{summary}</p>
          </div>
        </div>
      </a>
    </Link>
  )
}
