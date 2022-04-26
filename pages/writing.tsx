import { useRef, useState } from 'react'

import { pick } from 'contentlayer/client'
import Link from 'next/link'

import Container from '@components/Container'
import { cn } from '@lib/classNames'
import type { Writing } from 'contentlayer/generated'

import { allWritings } from '.contentlayer/generated'

// https://github.com/Pondorasti/alexandru/blob/main/pages/journal/index.tsx
const WritingPage = ({ posts }: { posts: Writing[] }) => {
  const [highlightedTab, setHighlightedTab] = useState<HTMLElement | null>(null)
  const [isHoveredFromNull, setIsHoveredFromNull] = useState(true)
  const [transform, setTransform] = useState('translate(0, 0')

  const parentRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const cardStyle =
    'flex flex-col px-4 py-6 relative hover:highlight sm:hover:!bg-transparent rounded-xl transition-colors duration-300'
  const asideStyle =
    "absolute [writing-mode:vertical-rl] h-full top-0 -left-12 md:-left-14 pr-11 text-center text-sm text-gray-400 dark:text-gray-600 font-['Luxurious_Roman']"

  function handleMouseOver(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) {
    const node = event.target as HTMLElement
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parent = parentRef.current!

    setIsHoveredFromNull(!highlightedTab)
    setHighlightedTab(node)

    const tabBoundingBox = node.getBoundingClientRect()
    const parentBoundingBox = parent.getBoundingClientRect()
    const highlightOffset = tabBoundingBox.top - parentBoundingBox.top

    // exit early if event triggered by children
    if (node.className === cardStyle || node.className === asideStyle) {
      setTransform(`translate(0, ${highlightOffset}px)`)
    }
  }
  return (
    <Container
      back={{
        href: '/',
        label: 'Index',
      }}
    >
      <h1 className='font-semibold'>Writing</h1>
      <div
        ref={parentRef}
        className='relative'
        onMouseLeave={() => setHighlightedTab(null)}
      >
        <div
          ref={highlightRef}
          className={cn(
            'absolute hidden h-[104px] w-ful sm:block',
            'duration-200',
            isHoveredFromNull ? 'transtition-none' : 'transition-transform'
          )}
          style={{ transform }}
        >
          <div
            className={cn(
              'h-full w-full rounded-xl highlight',
              highlightedTab ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-300'
            )}
          />
        </div>
        <div className='flex flex-col divide-y divide-gray-300 dark:divide-gray-700 mt-3'>
          {posts.map(post => (
            <Link key={post.slug} href={`/writing/${post.slug}`}>
              <a
                className={cn('flex flex-row justify-between py-3')}
                onMouseOver={handleMouseOver}
              >
                <span>{post.title}</span>
                <span>{post.publishedAt}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default WritingPage

export function getStaticProps() {
  const posts = allWritings
    .map(post => pick(post, ['slug', 'title', 'summary', 'publishedAt']))
    .sort(
      (a, b) =>
        Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt))
    )

  return {
    props: {
      posts,
    },
  }
}
