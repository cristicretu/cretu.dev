export default function Footer(): JSX.Element {
  const date = new Date()
  const localTime = date.toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: 'numeric',
    minute: 'numeric',
  })
  return (
    <div className='text-tertiary py-4 flex justify-between'>
      <span>Prioritize yourself.</span>
      <span>Local time {localTime}.</span>
    </div>
  )
}
