import ExternalLink from '@components/ExternalLink'

export default function Footer(): JSX.Element {
  return (
    <div className='flex flex-col justify-center w-full pb-3 max-w-2xl mx-auto text-gray-800 dark:text-gray-300 px-4 '>
      <div className='font-serif flex flex-row justify-between text-opacity-80 text-sm dark:text-opacity-80 text-gray-700 dark:text-gray-300 '>
        <p>CRISTIAN CREȚU</p>
        <p>{new Date().getFullYear()} - Prioritize yourself.</p>
      </div>
    </div>
  )
}
