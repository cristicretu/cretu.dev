import { useState } from 'react'

interface FlashcardProps {
  front: React.ReactNode
  children: React.ReactNode
  color?: string
  height?: string
  width?: string
}

export default function Flashcard({
  front,
  children,
  color = 'bg-green-500',
  height = 'h-96',
  width = 'w-full',
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    setIsFlipped(!isFlipped)
  }
  return (
    <div
      className={`flip-card ${width} cursor-pointer select-none ${height} `}
      onClick={() => handleClick()}
    >
      <div
        className={`flip-card-inner  h-full font-semibold text-2xl text-gray-100 text-center ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div
          className={`flip-card-front ${color} rounded-lg flex items-center p-6 justify-center gap-2`}
        >
          {front}
        </div>
        <div
          className={`flip-card-back ${color} rounded-lg flex flex-col gap-0 p-6 items-center justify-center`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
