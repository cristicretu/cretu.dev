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
        'transition-all duration-200',
        playing && isSameSong === true
          ? `bg-[url('https://snippets.alexandru.so/squiggle.svg')] `
          : 'custom-hover'
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
