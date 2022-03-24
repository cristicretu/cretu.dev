import { classNames } from '@lib/classNames'
import useAudio from '@lib/useAudio'

interface IPlayerProps {
  url: string
  title: string
}

export default function AudioPlayer({ url, title }: IPlayerProps) {
  const [playing, setPlaying] = useAudio(url)
  return (
    <div
      className={classNames(
        'flex flex-row items-center space-x-2  dark:text-red-400 text-red-600',
        playing === true ? 'text-blue-700 dark:text-blue-400' : ''
      )}
    >
      <button onClick={() => setPlaying(!playing)}>{title}</button>
      {playing ? (
        <div className='flex h-4 w-4 items-center'>
          <span className='animate-ping absolute h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-300 opacity-75'></span>
          <span className='relative rounded-full h-3 w-3 bg-blue-500 dark:bg-blue-300'></span>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
