export default function Flashcard() {
  return (
    <div className='flip-card max-w-full h-96'>
      <div className='flip-card-inner'>
        <div className='flip-card-front bg-green-500 rounded-lg flex flex-col items-center justify-center'>
          Spotify
        </div>
        <div className='flip-card-back bg-green-500 rounded-lg flex flex-col items-center justify-center'>
          <h1>John Doe</h1>
          <p>Architect & Engineer</p>
          <p>We love that guy</p>
        </div>
      </div>
    </div>
  )
}
