'use client';

import { useState } from 'react';

interface FlashcardProps {
  children: React.ReactNode;
  color?: string;
  front: React.ReactNode;
  height?: string;
  width?: string;
}

export default function Flashcard({
  front,
  children,
  color = 'bg-green-500',
  height = 'h-96',
  width = 'w-full',
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };
  return (
    <div
      className={`flip-card ${width} cursor-pointer select-none ${height} `}
      onClick={() => handleClick()}
    >
      <div
        className={`flip-card-inner  h-full text-center text-2xl font-semibold text-gray-100 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div
          className={`flip-card-front ${color} flex items-center justify-center gap-2 rounded-lg p-6`}
        >
          {front}
        </div>
        <div
          className={`flip-card-back ${color} flex flex-col items-center justify-center gap-0 rounded-lg p-6`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
