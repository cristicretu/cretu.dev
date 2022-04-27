import { Fragment, useEffect, useState } from 'react'

import { Dialog, Transition } from '@headlessui/react'

import { cn } from '@lib/classNames'

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false)

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
              'max-w-2xl mx-auto px-2',
              'relative',
              'bg-red-500',
              'rounded-md shadow-2xl',
              'ring-1 ring-black/10'
            )}
          >
            m,essi
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
