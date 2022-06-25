import Image from 'next/image'

import { cn } from '@lib/classNames'

interface ToolProps {
  image: string
  name: string
  description?: string
}

export default function Tool({
  image,
  name,
  description,
}: ToolProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex gap-6 items-center',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'rounded-lg px-4 -mx-4'
      )}
    >
      <div className='relative h-6 w-6'>
        <Image
          src={image}
          alt='Figma'
          objectFit='cover'
          layout='fill'
          className='absolute inset-0 object-cover p-2'
        />
      </div>
      <div className='flex flex-col border-b  border-gray-200 dark:border-gray-800  w-full py-4'>
        <h2 className='text-secondary font-semibold '>{name}</h2>
        {description && <p className='text-tertiary text-sm'>{description}</p>}
      </div>
    </div>
  )
}
