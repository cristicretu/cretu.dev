import Image from 'next/image'

interface IImagePreviewProps {
  src: string
  title: string
  subtitle: string
  link?: string
  height?: string
}

export default function ImagePreview({
  src,
  title,
  subtitle,
  link,
  height,
}: IImagePreviewProps) {
  return (
    <div
      onClick={() => {
        if (link?.startsWith('https:/')) {
          window.open(link, '_blank')
        }
      }}
      className='flex cursor-pointer flex-col group bg-elevated relative overflow-hidden rounded-xl hover:bg-opacity-20'
    >
      <span className='absolute top-5 right-5 z-0 h-8 w-8 rounded-full bg-gray-800 dark:bg-gray-200 transition-all duration-300 group-hover:scale-[36]'></span>

      <div className='flex justify-between items-center p-6 z-10 relative'>
        <div className='flex items-center space-x-2'>
          <h3 className='font-semibold  transition-all duration-300 text-gray-900 dark:text-gray-100 group-hover:text-gray-100 dark:group-hover:text-gray-900'>
            {title}
          </h3>
          <span className='text-[5px] text-gray-600 dark:text-gray-400 group-hover:text-gray-400 dark:group-hover:text-gray-600'>
            ●
          </span>
          <p className='text-gray-700 dark:text-gray-300 group-hover:text-gray-300 dark:group-hover:text-gray-700 text-sm'>
            {subtitle}
          </p>
        </div>
        {link?.startsWith('https:/') && (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            className='px-1.5 rounded-full text-gray-100 dark:text-gray-900 group-hover:bg-gray-700 dark:group-hover:bg-gray-300'
          >
            ↗
          </a>
        )}
        {link?.startsWith('/static') && (
          <a href={link} download>
            ↓
          </a>
        )}
      </div>
      <div
        className={`relative w-full 
        } group-hover:scale-105 group-hover:saturate-[1.3] transition-all group-hover:rotate-1`}
        style={{ height: height || '192px' }}
      >
        <Image
          src={src}
          alt={title}
          fill
          className='object-cover ml-8 rounded-tl-lg shadow-sm border-t border-l border-black/5 shadow-black/5 dark:border-white/5  dark:shadow-black/10'
          quality={95}
        />
      </div>
    </div>
  )
}
