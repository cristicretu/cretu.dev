import Container from '@components/Container'
import { cn } from '@lib/classNames'

const Bionic = () => {
  return (
    <Container
      footer={false}
      back={{
        href: '/experiments',
        label: 'Experiments',
      }}
    >
      <div className='flex flex-col gap-6'>
        <h1 className='text-xl font-semibold'>Bionic Reading</h1>
        <div className='flex flex-col gap-2 text-secondary'>
          <TextToBionic text='Don’t underestimate the power of vision and direction. These are irresistible forces, able to transform what might appear to be unconquerable obstacles into traversable pathways and expanding opportunities. Strengthen the individual. Start with yourself. Take care with yourself. Define who you are. Refine your personality. Choose you destination and articulate your Being. As the great nineteenth-century German philosopher Friedrich Nietzsche so brilliantly noted, ‘He whose life has a why can bear almost any how’.' />
          <TextToBionic
            cls='text-right italic opacity-50 text-sm'
            text='Jordan Peterson | 12 Rules for Life'
          />
        </div>
      </div>
    </Container>
  )
}

export default Bionic

function TextToBionic({
  text,
  cls,
}: {
  text: string
  cls?: string
}): JSX.Element {
  const words = text.split(' ')
  return (
    <p className={cn('leading-10 ', cls as string)}>
      {words.map((word, index) => (
        <WordToBionic key={index} word={word} />
      ))}
    </p>
  )
}

function WordToBionic({ word }: { word: string }): JSX.Element {
  // Split the word in half (ceil half)
  // the first part will be bold so
  // that the eyes could lock onto it
  // the second part will be normal
  const changeIndex = Math.ceil(word.length / 2)
  return (
    <span>
      {word.split('').map((char, index) => (
        <span
          key={index}
          className={index < changeIndex ? 'font-semibold' : 'font-base'}
        >
          {char}
        </span>
      ))}{' '}
    </span>
  )
}
