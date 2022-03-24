import { classNames } from '@lib/classNames'

interface IPlayerProps {
  title: string
  url: string
  playing: boolean
  setPlaying: (playing: boolean) => void
}

export default function AudioPlayer({
  title,
  playing,
  setPlaying,
  url,
}: IPlayerProps) {
  let normalizedUrl = url.split('_')[0]
  normalizedUrl = normalizedUrl.split('/')[3]
  const isSameSong = title.replace('-', '').includes(normalizedUrl)
  return (
    <div
      className={classNames(
        'flex flex-row items-center space-x-2  dark:text-red-400 text-red-600',
        playing && isSameSong === true ? 'text-blue-700 dark:text-blue-400' : ''
      )}
    >
      <button
        onClick={() => {
          if (isSameSong) setPlaying(!playing)
        }}
      >
        {title}
      </button>
      {playing && isSameSong ? (
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
