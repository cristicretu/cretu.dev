import type { ReactNode } from 'react';

interface FlashcardProps {
  children: ReactNode;
  color?: string;
  front: ReactNode;
  height?: string;
  width?: string;
}

// CSS-only flip card - hover to flip, no JS needed
export default function Flashcard({
  front,
  children,
  color = 'bg-green-500',
  height = 'h-96',
  width = 'w-full',
}: FlashcardProps) {
  return (
    <div className={`flashcard-container ${width} ${height}`}>
      <div className="flashcard-inner">
        <div className={`flashcard-front ${color}`}>
          {front}
        </div>
        <div className={`flashcard-back ${color}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
