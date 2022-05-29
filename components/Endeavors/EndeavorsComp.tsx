import Image from 'next/image'

import Parallax from '@components/Parallax'
import { endeavorsList } from '@data/endeavors/endeavorsItems'

export default function Endeavors() {
  return (
    <div className='flex flex-col gap-4'>
      {endeavorsList.map((item, key) => (
        <Parallax key={key}>
          <div
            onClick={() => window.open(item.link, '_blank')}
            className='cursor-pointer bg-gray-100 group hover:bg-gray-200 border-black/10 dark:bg-gray-900 border dark:border-white/10 dark:hover:bg-gray-800 transition-all rounded-lg'
          >
            <div className='h-72 w-full relative'>
              <Image
                src={item.img}
                objectFit='cover'
                layout='fill'
                className='rounded-t-md'
                alt='Summary image'
              />
            </div>
            <div className='p-2 flex flex-col gap-1'>
              <p className='font-semibold text-lg'>
                {item.title}
                <span className='ml-2 invisible group-hover:visible transition-opacity'>
                  ↗
                </span>
              </p>
              <p className='text-secondary'>{item.description}</p>
              <p className='text-sm text-tertiary'>{item.timeline}</p>
            </div>
          </div>
        </Parallax>
      ))}
    </div>
  )
}
