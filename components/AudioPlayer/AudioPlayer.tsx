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
    <span
      className={classNames(
        ' dark:text-red-400 text-red-600 hover:text-purple-600 dark:hover:text-purple-400 transition-all',
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
    </span>
  )
}
