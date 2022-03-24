import useAudio from '@lib/useAudio'

interface IPlayerProps {
  url: string
  title: string
}

export default function AudioPlayer({ url, title }: IPlayerProps) {
  const [playing, setPlaying] = useAudio(url)
  return (
    <div>
      <button onClick={() => setPlaying(!playing)}>{title}</button>
    </div>
  )
}
