import Image from 'next/image'

interface IImagePreviewProps {
  src: string
  title: string
  subtitle?: string
  link?: string
}

export default function ImagePreview({
  src,
  title,
  subtitle,
  link,
}: IImagePreviewProps) {
  return (
    <div className='flex flex-col space-y-4 group'>
      <div className='relative w-full h-48 mt-8'>
        <Image
          src={src}
          alt={title}
          fill
          className='object-cover'
          quality={95}
        />
      </div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <h3 className='font-semibold  transition-all duration-300'>
            {title}
          </h3>
          {subtitle && (
            <>
              <span className='text-[5px]'>●</span>
              <p>{subtitle}</p>
            </>
          )}
        </div>
        {link && (
          <a href={link} target='_blank' rel='noopener noreferrer'>
            ↓
          </a>
        )}
      </div>
    </div>
  )
}
