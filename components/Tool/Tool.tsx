import { cn } from '@lib/classNames'

interface ToolProps {
  name: string
  description?: string
  svg?: React.ReactNode
  link: string
}

export default function Tool({
  name,
  description,
  svg,
  link,
}: ToolProps): JSX.Element {
  return (
    <a
      className={cn(
        'flex gap-6 items-center',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'rounded-lg px-4 -mx-4 my-4',
        'cursor-pointer'
      )}
      href={link}
      target='_blank'
      rel='noopener noreferrer'
    >
      <div className='relative h-6 w-6'>{svg}</div>
      <div className='flex flex-col border-b  border-gray-200 dark:border-gray-800  w-full py-6 -my-2'>
        <h2 className='text-secondary font-semibold '>{name}</h2>
        {description && <p className='text-tertiary text-sm'>{description}</p>}
      </div>
    </a>
  )
}
