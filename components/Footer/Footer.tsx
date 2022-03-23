import ExternalLink from '@components/ExternalLink'

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Footer(): JSX.Element {
  return (
    <div className='flex flex-col justify-center w-full pb-3 max-w-2xl mx-auto text-gray-800 dark:text-gray-300 '>
      <hr className='w-full border-1 border-gray-200 dark:border-gray-800 ' />
      <div className='font-serif flex flex-row justify-between text-opacity-70 mt-2 dark:text-opacity-70 text-lg text-gray-700 dark:text-gray-300 '>
        <p>{new Date().getFullYear()} - Prioritize yourself.</p>
        <p>
          Made with delight by{' '}
          <ExternalLink href='https://twitter.com/cristicrtu'>
            Cristian Crețu.
          </ExternalLink>
        </p>
      </div>
    </div>
  )
}
