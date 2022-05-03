import { useEffect, useState } from 'react'

export default function Footer(): JSX.Element {
  const [localTime, setLocalTime] = useState(
    new Date().toLocaleString('ro-RO', {
      timeZone: 'Europe/Bucharest',
      hour: 'numeric',
      minute: 'numeric',
    })
  )

  useEffect(() => {
    setInterval(() => {
      const date = new Date()
      const time = date.toLocaleString('ro-RO', {
        timeZone: 'Europe/Bucharest',
        hour: 'numeric',
        minute: 'numeric',
      })
      setLocalTime(time)
    }, 1000)
  })
  return (
    <div className='text-tertiary py-4 flex justify-between'>
      <span>Prioritize yourself.</span>
      <span>Local time {localTime}.</span>
    </div>
  )
}
