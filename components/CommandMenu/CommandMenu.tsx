import { Fragment, useEffect, useRef, useState } from 'react'

import { Dialog, Transition } from '@headlessui/react'

import { commands } from '@data/commands/cmd'
import { cn } from '@lib/classNames'

export default function CommandMenu() {
  // dialog state
  const [isOpen, setIsOpen] = useState(false)

  const [highlightedTab, setHighlightedTab] = useState<HTMLElement | null>(null)
  const [isHoveredFromNull, setIsHoveredFromNull] = useState(true)
  const [transform, setTransform] = useState('translate(0, 0')

  const parentRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const cardStyle =
    'flex flex-col px-2 py-3 relative hover:highlight sm:hover:!bg-transparent rounded-xl transition-colors duration-300'

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
    if (node.className === cardStyle) {
      setTransform(`translate(0, ${highlightOffset}px)`)
    }
  }

  useEffect(() => {
    const clickedCmdk = (e: {
      which: number
      metaKey: boolean
      preventDefault: () => void
    }) => {
      const charCode = String.fromCharCode(e.which).toLowerCase()
      if (e.metaKey && charCode === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    window.addEventListener('keydown', clickedCmdk)
    return () => {
      window.removeEventListener('keydown', clickedCmdk)
    }
  }, [isOpen])

  console.log(highlightedTab)

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={setIsOpen}
        className={cn('fixed inset-0', 'p-4 pt-[25vh] overflow-y-auto')}
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
              'max-w-2xl mx-auto px-4',
              'relative',
              'bg-primary filter-blur',
              'rounded-md shadow-2xl dark:shadow-gray-800',
              'ring-1 ring-black/10 dark:ring-gray-500/10'
            )}
          >
            <Dialog.Title>
              <input />
            </Dialog.Title>
            <Dialog.Description>
              <div ref={parentRef} className='relative'>
                {/* Highlighter */}
                <div
                  ref={highlightRef}
                  className={cn(
                    'absolute hidden h-12 w-full sm:block',
                    'duration-200',
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
                {/* Entries */}
                {commands.map((meta, index) => (
                  <a
                    key={index}
                    className={cardStyle}
                    onMouseOver={handleMouseOver}
                  >
                    <span className='text-gray-500 dark:text-gray-500'>
                      {meta.label}
                    </span>
                  </a>
                ))}
                <span>asdas</span>
                {commands.map((meta, index) => (
                  <a
                    key={index}
                    className={cardStyle}
                    onMouseOver={handleMouseOver}
                  >
                    <p className='text-gray-500 dark:text-gray-500'>
                      {meta.label}
                    </p>
                  </a>
                ))}
              </div>
            </Dialog.Description>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
