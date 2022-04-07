import ExternalLink from '@components/ExternalLink'

export default function Footer(): JSX.Element {
  return (
    <div className='flex flex-col justify-center w-full pb-3 max-w-2xl mx-auto text-gray-800 dark:text-gray-300 px-4 '>
      <div className='font-sans flex flex-row justify-between text-opacity-80 mt-2 dark:text-opacity-80 text-gray-700 dark:text-gray-300 '>
        <p>{new Date().getFullYear()} - Prioritize yourself.</p>
        <p>
          Made with delight by{' '}
          <ExternalLink href='https://twitter.com/cristicrtu'>
            Cristian Crețu
          </ExternalLink>
        </p>
      </div>
    </div>
  )
}
