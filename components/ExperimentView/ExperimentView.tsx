import Link from 'next/link'

interface ExperimentViewProps {
  children: React.ReactNode
  href: string
}

export default function ExperimentView({
  children,
  href,
}: ExperimentViewProps): JSX.Element {
  return (
    <Link href={`/experiments/${href}`}>
      <a className='flex flex-col items-center justify-center h-48 p-8 border border-gray-200 w-96 bg-dots rounded-xl dark:border-gray-800'>
        {children}
      </a>
    </Link>
  )
}
