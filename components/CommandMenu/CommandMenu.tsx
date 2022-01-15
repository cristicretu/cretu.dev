import * as DialogPrimitive from '@radix-ui/react-dialog';

import React, { Fragment, useEffect, useState } from 'react';

import { Transition } from '@headlessui/react';

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const clickedCmdk = (e) => {
      let charCode = String.fromCharCode(e.which).toLowerCase();
      if (e.metaKey && charCode === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', clickedCmdk);
    return () => {
      window.removeEventListener('keydown', clickedCmdk);
    };
  }, [isOpen]);
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          aria-label="Command Menu"
          type="button"
          className={cn(
            'inline-flex justify-center px-2 py-1 text-2xl font-extralight rounded-md select-none',
            'text-gray-900 bg-white hover:bg-gray-50 dark:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700',
            'border border-gray-300 dark:border-gray-600',
            'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
          )}
        >
          ⌘
        </button>
      </DialogPrimitive.Trigger>
      <Transition.Root show={isOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogPrimitive.Overlay
            forceMount
            className="fixed inset-0 z-20 bg-black/70"
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPrimitive.Content
            forceMount
            className={cn(
              'fixed z-50',
              'w-[95vw] md:w-full max-w-2xl md:-ml-2 rounded-lg',
              'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
              'myblur border border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 ',
              'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
            )}
          >
            <DialogPrimitive.Title className="w-full p-4 border-b border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 ">
              <input
                // value={Results}
                className="block w-full text-gray-900 placeholder-gray-500 bg-transparent outline-none dark:placeholder-gray-600 dark:text-gray-100"
                aria-label="Enter a command or search"
                type="text"
                // onChange={(e) => setResults(e.target.value)}
                placeholder="Enter a command or search..."
              />
            </DialogPrimitive.Title>
            {/* <DialogPrimitive.Description className="mt-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogPrimitive.Description>
            <form className="mt-2 space-y-2">
              <fieldset>
                <label
                  htmlFor="firstName"
                  className="text-xs font-medium text-gray-700 dark:text-gray-400"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Tim"
                  autoComplete="given-name"
                  className={cn(
                    'block w-full mt-1 rounded-md',
                    'text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600',
                    'dark:bg-gray-800 border border-gray-400 dark:border-gray-700 focus-visible:border-transparent',
                    'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
                  )}
                />
              </fieldset>
              <fieldset>
                <label
                  htmlFor="familyName"
                  className="text-xs font-medium text-gray-700 dark:text-gray-400"
                >
                  Family Name
                </label>
                <input
                  id="familyName"
                  type="text"
                  placeholder="Cook"
                  autoComplete="family-name"
                  className={cn(
                    'block w-full mt-1 rounded-md',
                    'text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600',
                    'dark:bg-gray-800 border border-gray-400 dark:border-gray-700 focus-visible:border-transparent',
                    'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
                  )}
                />
              </fieldset>
            </form>

            <div className="flex justify-end mt-4">
              <DialogPrimitive.Close
                className={cn(
                  'inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md select-none',
                  'text-white dark:text-gray-100 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600',
                  'border border-transparent',
                  'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
                )}
              >
                Save
              </DialogPrimitive.Close>
            </div>

            <DialogPrimitive.Close
              className={cn(
                'absolute inline-flex items-center justify-center top-3.5 right-3.5 p-1 rounded-full',
                'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
              )}
            >
            </DialogPrimitive.Close> */}
          </DialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </DialogPrimitive.Root>
  );
}
