import { useEffect, useState } from 'react'

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
    <Dialog
      open={isOpen}
      onClose={setIsOpen}
      className={cn('fixed inset-0', 'p-4 pt-[25vh] overflow-y-auto')}
    >
      <Dialog.Overlay
        className={cn('fixed inset-0 bg-gray-50/75 dark:bg-black/75')}
      />
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
        <button onClick={() => changeTheme}>change</button>
      </div>
    </Dialog>
  )
}
