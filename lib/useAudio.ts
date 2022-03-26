import { useEffect, useState } from 'react'
import { silencePromise } from './promise'

const useAudio = (url: string) => {
  const [audio, setAudio] = useState(
    typeof Audio !== 'undefined' && new Audio(url)
  )
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setAudio(new Audio(url))
  }, [url])

  useEffect(() => {
    playing ? silencePromise(audio.play()) : silencePromise(audio.pause())
  }, [audio, playing])

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false))
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false))
      silencePromise(audio.pause())
    }
  }, [audio])

  return [playing, setPlaying] as const
}

export default useAudio
