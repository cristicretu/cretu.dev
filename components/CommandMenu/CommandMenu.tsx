import { Fragment, useEffect, useRef, useState } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'

import { commands } from '@data/commands/cmd'
import { cn } from '@lib/classNames'

export default function CommandMenu() {
  // dialog state
  const itemsRef = useRef(commands)

  console.log('itemsRef', itemsRef)

  const [isOpen, setIsOpen] = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const [highlightedTab, setHighlightedTab] = useState<HTMLElement | null>(null)
  const [isHoveredFromNull, setIsHoveredFromNull] = useState(true)
  const [transform, setTransform] = useState('translate(0, 0')

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
    const navigated = (e: { keyCode: number; preventDefault: () => void }) => {
      // up
      if (e.keyCode === 38 && isOpen) {
        e.preventDefault()
        if (highlightedTab) {
          const prev = highlightedTab.previousElementSibling
          if (prev) {
            const parent = parentRef.current!

            setIsHoveredFromNull(!highlightedTab)
            setHighlightedTab(prev as HTMLElement)

            const tabBoundingBox = prev!.getBoundingClientRect()
            const parentBoundingBox = parent.getBoundingClientRect()
            const highlightOffset = tabBoundingBox!.top - parentBoundingBox.top

            // exit early if event triggered by children
            if (prev.className === cardStyle) {
              setTransform(`translate(0, ${highlightOffset}px)`)
            }
          }
        }
        // down
      } else if (e.keyCode === 40 && isOpen) {
        e.preventDefault()
        if (highlightedTab) {
          const next = highlightedTab.nextElementSibling
          if (next) {
            const parent = parentRef.current!

            setIsHoveredFromNull(!highlightedTab)
            setHighlightedTab(next as HTMLElement)

            const tabBoundingBox = next!.getBoundingClientRect()
            const parentBoundingBox = parent.getBoundingClientRect()
            const highlightOffset = tabBoundingBox!.top - parentBoundingBox.top

            // exit early if event triggered by children
            if (next.className === cardStyle) {
              setTransform(`translate(0, ${highlightOffset}px)`)
            }
          }
        }
      }
    }

    window.addEventListener('keydown', navigated)

    return () => {
      window.removeEventListener('keydown', navigated)
    }
  }, [highlightedTab, isOpen])

  // CMD + K
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

  // Press enter & execute command
  useEffect(() => {
    const callback = (e: { keyCode: number }) => {
      if (e.keyCode === 13 && isOpen && highlightedTab) {
        highlightedTab.click()
      }
    }

    window.addEventListener('keydown', callback)
    return () => {
      window.removeEventListener('keydown', callback)
    }
  }, [isOpen, highlightedTab])

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
            {/* <Dialog.Title>
              <input />
            </Dialog.Title> */}
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
                  <Link href={meta.href!} key={index}>
                    <a className={cardStyle} onMouseOver={handleMouseOver}>
                      <div className='flex flex-row justify-between'>
                        <div>icon</div>
                        <div>{meta.label}</div>
                      </div>
                    </a>
                  </Link>
                ))}
                <span>Separator</span>
                {commands.map((meta, index) => (
                  <li key={index}>
                    <a className={cardStyle} onMouseOver={handleMouseOver}>
                      <div className='flex flex-row justify-between'>
                        <div>icon</div>
                        <div>{meta.label}</div>
                      </div>
                    </a>
                  </li>
                ))}
              </div>
            </Dialog.Description>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
