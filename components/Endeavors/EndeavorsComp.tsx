import React from 'react'

import Image from 'next/image'

import type { Endeavor } from '@data/endeavors/endeavorsItems'
import { cn } from '@lib/classNames'

interface IEndeavorsProps {
  endeavor: Endeavor
}

export function Endeavors({ endeavor }: IEndeavorsProps): JSX.Element {
  return (
    <a
      className={cn(
        'relative w-64 h-64',
        'flex-shrink-0',
        'p-4 my-4',
        'translate',
        'odd:rotate-2 even:-rotate-2',
        'group',
        'cursor-pointer',
        'shadow-md',
        'rounded-xl',
        'snap-center'
      )}
      href={endeavor.link}
      target='_blank'
      rel='noopener noreferrer'
    >
      <>
        <Image
          src={endeavor.img}
          alt={endeavor.title}
          objectFit='cover'
          layout='fill'
          className={cn(
            'rounded-xl',
            'transition-opacity duration-200 opacity-50 lg:opacity-100 lg:group-hover:opacity-30'
          )}
        />
        <div
          className={cn(
            'absolute bottom-0 left-0',
            'p-4',
            'transition duration-200',
            'lg:invisible lg:group-hover:visible'
          )}
        >
          <h3 className='font-bold text-lg text-primary'>{endeavor.title} ↗</h3>
          <p className='font-black text-xs leading-tight max-w-lg'>
            {endeavor.description}
          </p>
        </div>
      </>
    </a>
  )
}

export const MemoizedEndeavors = React.memo(Endeavors)
