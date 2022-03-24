import { useEffect, useState } from 'react'

const useAudio = (url: string) => {
  const [audio, setAudio] = useState(
    typeof Audio !== 'undefined' && new Audio(url)
  )
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setAudio(new Audio(url))
  }, [url])

  useEffect(() => {
    playing ? audio.play() : audio.pause()
  }, [audio, playing])

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false))
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false))
      audio.pause()
    }
  }, [audio])

  return [playing, setPlaying] as const
}

export default useAudio
