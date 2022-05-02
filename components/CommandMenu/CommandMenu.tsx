import React, {
  Fragment,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'

import { Navigation, Socials, Themes } from '@data/commands/cmd'
import { cn } from '@lib/classNames'

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const [results] = useState(Navigation.concat(Socials).concat(Themes))
  const [input, setInput] = useState('')

  const [highlightedTab, setHighlightedTab] = useState<HTMLElement | null>(null)
  const [isHoveredFromNull, setIsHoveredFromNull] = useState(true)
  const [transform, setTransform] = useState('translate(0, 0')
  const parentRef = useRef<HTMLUListElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const cardStyle =
    'px-2 py-3 relative text-base hover:highlight hover:!bg-transparent rounded-xl transition-colors duration-300'

  const placeholder = useMemo(() => {
    if (highlightedTab) {
      return highlightedTab.textContent
    }
    if (input.length === 0) {
      return 'Type a command or search...'
    }
  }, [highlightedTab, input])

  const searchResults = useMemo(() => {
    const answer = []

    const myFilter = results.filter(result =>
      result.name.toLowerCase().includes(input.toLowerCase())
    )

    let last = ''
    for (let i = 0; i < myFilter.length; i++) {
      const result = myFilter[i]
      if (i === 0) {
        answer.push(result.section)
        last = result.section
      } else {
        if (last !== result.section) {
          answer.push(result.section)
          last = result.section
        }
      }

      answer.push(result)
    }

    return answer
  }, [input, results])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleReset = () => {
    setInput('')
  }

  const handleMouseOver = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const node = event.target as HTMLElement
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parent = parentRef.current!

    setIsHoveredFromNull(!highlightedTab)
    setHighlightedTab(node)

    const tabBoundingBox = node.getBoundingClientRect()
    const parentBoundingBox = parent.getBoundingClientRect()
    const highlightOffset = tabBoundingBox.top - parentBoundingBox.top

    // exit early if event triggered by children
    if (node.className === cardStyle) {
      setTransform(
        `translate(0, ${highlightOffset + parentRef.current!.scrollTop}px)`
      )
    }
  }

  const setHighlight = (idx: number) => {
    if (parentRef.current) {
      const children = parentRef.current!.children
      changeHighlight(children[idx] as HTMLElement)
    }
  }

  const changeHighlight = (node: HTMLElement | null) => {
    setIsHoveredFromNull(!highlightedTab)

    if (node) {
      setHighlightedTab(node)

      const tabBoundingBox = node.getBoundingClientRect()
      const parentBoundingBox = parentRef.current!.getBoundingClientRect()
      const highlightOffset = tabBoundingBox.top - parentBoundingBox.top

      if (node.className === cardStyle) {
        console.log('highlightOffset', highlightOffset)
        console.log('tabBoundingBox', tabBoundingBox)
        console.log('parrentRef.current', parentRef.current!.scrollTop)
        setTransform(
          `translate(0, ${highlightOffset + parentRef.current!.scrollTop}px)`
        )
      }

      node.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    }
  }

  useEffect(() => {
    const handler = (event: {
      key: string
      preventDefault: () => void
      metaKey: boolean
    }) => {
      if (event.key === 'ArrowUp' && isOpen) {
        event.preventDefault()
        const index = results.findIndex(
          result => result.name === highlightedTab?.textContent
        )

        if (index > 0) {
          const prev = highlightedTab?.previousElementSibling
          if (prev) {
            changeHighlight(prev as HTMLElement)
          }
        }
      } else if (event.key === 'ArrowDown' && isOpen) {
        event.preventDefault()
        const next = highlightedTab?.nextElementSibling
        if (next) {
          changeHighlight(next as HTMLElement)
        }
      } else if (event.key === 'Enter' && isOpen && highlightedTab) {
        highlightedTab?.click()
      } else if (event.key === 'k' && event.metaKey) {
        event.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <Transition show={isOpen} as={Fragment} afterLeave={handleReset}>
      <Dialog
        onClose={setIsOpen}
        className={cn('fixed inset-0', 'p-4 pt-[20vh] overflow-y-auto')}
      >
        <Transition.Child
          enter='duration-100 ease-out'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='duration-100 ease-in'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <Dialog.Overlay
            className={cn('fixed inset-0 bg-gray-50/75 dark:bg-black/75')}
          />
        </Transition.Child>

        <Transition.Child
          enter='duration-100 ease-out'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='duration-100 ease-in'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <div
            className={cn(
              'max-w-2xl mx-auto',
              'relative',
              'bg-primary filter-blur',
              'rounded-md shadow-2xl dark:shadow-gray-900',
              'ring-1 ring-black/10 dark:ring-gray-700/50',
              'flex flex-col'
            )}
          >
            <Dialog.Title
              className={cn('border-b border-black/10 dark:border-gray-700/50')}
            >
              <input
                autoComplete='off'
                className={cn(
                  'w-full',
                  'p-4',
                  'bg-transparent',
                  'focus:ring-0 outline-none'
                )}
                placeholder={placeholder as any}
                aria-label='Search for links or commands'
                value={input}
                onChange={handleChange}
                type='text'
                spellCheck={false}
              />
            </Dialog.Title>
            <Dialog.Description>
              {!searchResults.length && (
                <p className='text-secondary p-2'>No results found.</p>
              )}
              {searchResults.length && (
                <ul
                  ref={parentRef}
                  className={cn(
                    'relative',
                    'text-sm text-quaternary',
                    'my-4 mx-3',
                    'overflow-auto h-[32vh]'
                  )}
                >
                  <div
                    ref={highlightRef}
                    className={cn(
                      'absolute h-12 w-full block',
                      'duration-200 ',
                      isHoveredFromNull
                        ? 'transition-none'
                        : 'transition-transform '
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

                  {searchResults.map((result, index) => {
                    if (typeof result === 'string') {
                      return <Fragment key={index}>{result}</Fragment>
                    }
                    return (
                      <div
                        key={index}
                        className={cn(cardStyle)}
                        onMouseOver={handleMouseOver as MouseEventHandler}
                        onMouseLeave={() => setIsHoveredFromNull(false)}
                        onClick={() => {
                          setIsOpen(false)
                          result.perform ? result.perform() : undefined
                        }}
                      >
                        {result.name}
                      </div>
                      // <MenuItem
                      //   key={index}
                      //   index={index}
                      //   activeIndex={activeIndex}
                      //   className={cardStyle}
                      //   onMouseOver={handleMouseOver}
                      //   onMouseLeave={() => setIsHoveredFromNull(false)}
                      //   onClick={() => {
                      //     setIsOpen(false)
                      //     result.perform ? result.perform() : undefined
                      //   }}
                      // >
                      //   {result.name}
                      // </MenuItem>
                    )
                  })}
                </ul>
              )}
            </Dialog.Description>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
