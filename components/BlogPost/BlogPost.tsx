import React from 'react'

import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface BlogPostProps {
  title: string
  summary: string
  slug: string
  type?: string
  date?: string
  variant: 'writing' | 'index'
}

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
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
        <a className='flex items-center w-full space-x-2 rounded-md '>
          <div className='flex flex-col space-y-1'>
            <div className='flex justify-between'>
              <p
                className={cx(
                  ' font-bold text-black dark:text-white',
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
        <em className='text-sm rotate-90'>
          <hr className='h-full mb-2 dotted'></hr>
          {format(parseISO(date), 'MMMM dd')}
        </em>
        <div className='flex items-center w-full space-x-2 rounded-md '>
          <div className='flex flex-col space-y-1'>
            <div className='flex justify-between'>
              <p
                className={cx(
                  ' font-bold text-black dark:text-white',
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
