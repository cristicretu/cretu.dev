import Image from 'next/image'

interface IImagePreviewProps {
  src: string
  title: string
  subtitle: string
  link?: string
  height?: number
}

export default function ImagePreview({
  src,
  title,
  subtitle,
  link,
  height,
}: IImagePreviewProps) {
  return (
    <div className='flex flex-col group bg-elevated overflow-hidden rounded-xl hover:bg-opacity-20'>
      <div className='flex justify-between items-center p-6'>
        <div className='flex items-center space-x-2'>
          <h3 className='font-semibold  transition-all duration-300'>
            {title}
          </h3>
          <span className='text-[5px]'>●</span>
          <p className='text-tertiary text-sm'>{subtitle}</p>
        </div>
        {link && (
          <a href={link} target='_blank' rel='noopener noreferrer'>
            ↓
          </a>
        )}
      </div>
      <div
        className={`relative w-full h-${
          height ?? 48
        } group-hover:scale-105 group-hover:saturate-[1.3] transition-all group-hover:rotate-2`}
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
