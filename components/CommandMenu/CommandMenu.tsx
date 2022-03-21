import React, { Fragment, ReactNode, useEffect, useRef, useState } from 'react'

import { Transition } from '@headlessui/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  ArrowRightIcon,
  GitHubLogoIcon,
  Half2Icon,
  MoonIcon,
  SunIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/router'

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface CommandMenuProps {
  label?: string
  href?: string
  icon?: ReactNode
  type?: 'Navigation' | 'Socials' | 'Theme'
  theme?: 'dark' | 'light' | 'system'
  rightText?: string
}

interface Props {
  buttonOpen: boolean
  setButtonOpen: (open: boolean) => void
}

export default function CommandMenu({ buttonOpen, setButtonOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { resolvedTheme, setTheme, theme } = useTheme()

  const router = useRouter()

  const all: CommandMenuProps[] = [
    {
      label: 'Home',
      href: '/',
      icon: <ArrowRightIcon width={20} height={20} />,
      type: 'Navigation',
      rightText: 'Go to',
    },
    {
      label: 'Writing',
      href: '/writing',
      icon: <ArrowRightIcon width={20} height={20} />,
      type: 'Navigation',
      rightText: 'Go to',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/cristicretu',
      icon: <GitHubLogoIcon width={20} height={20} />,
      type: 'Socials',
      rightText: 'Open',
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/cristicrtu',
      icon: <TwitterLogoIcon width={20} height={20} />,
      type: 'Socials',
      rightText: 'Open',
    },
    {
      label:
        resolvedTheme === 'light'
          ? 'Change theme to dark'
          : 'Change theme to light',
      icon:
        resolvedTheme === 'light' ? (
          <MoonIcon width={20} height={20} />
        ) : (
          <SunIcon width={20} height={20} />
        ),
      type: 'Theme',
      theme: resolvedTheme === 'light' ? 'dark' : 'light',
      rightText: 'Run command',
    },
    {
      label: 'Change theme to system',
      icon: <Half2Icon width={20} height={20} />,
      type: 'Theme',
      theme: 'system',
      rightText: 'Run command',
    },
  ]

  const [cursor, setCursor] = useState(0)

  const [cursorMoved, setCursorMoved] = useState(false)

  const [Results, setResults] = useState('')
  const SearchResults = all
    .sort()
    .filter(item => item.label.toLowerCase().includes(Results.toLowerCase()))

  const itemsRef = useRef([])

  const handleChange = e => {
    setResults(e.target.value)
    setCursor(0)
  }

  const samePage = href => {
    return href === router.pathname
  }

  function containsSocial(element) {
    return element.type === 'Socials'
  }

  function containsTheme(element) {
    return element.type === 'Theme'
  }

  function containsNavigation(element) {
    return element.type === 'Navigation'
  }

  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, SearchResults.length)
  }, [SearchResults])

  useEffect(() => {
    setIsOpen(buttonOpen)
  }, [buttonOpen, setButtonOpen])

  useEffect(() => {
    const navigated = e => {
      // up
      if (e.keyCode === 38 && isOpen) {
        setCursor(cursor =>
          cursor === 0 ? SearchResults.length - 1 : cursor - 1
        )
        setCursorMoved(true)
        itemsRef.current[
          cursor === 0 ? SearchResults.length - 1 : cursor - 1
        ].scrollIntoView(
          cursor === 0
            ? { behaviour: 'smooth' }
            : {
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth',
              }
        )
        // down
      } else if (e.keyCode === 40 && isOpen) {
        setCursor(cursor =>
          cursor + 1 > SearchResults.length - 1 ? 0 : cursor + 1
        )
        setCursorMoved(true)
        itemsRef.current[
          cursor + 1 > SearchResults.length - 1 ? 0 : cursor + 1
        ].scrollIntoView(
          cursor + 1 > SearchResults.length - 1
            ? {
                behavior: 'smooth',
              }
            : {
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth',
              }
        )
      }
    }

    window.addEventListener('keydown', navigated)
    return () => {
      window.removeEventListener('keydown', navigated)
    }
  })

  useEffect(() => {
    const clickedCmdk = e => {
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

  useEffect(() => {
    const clickedEnter = e => {
      if (e.keyCode === 13 && isOpen) {
        if (SearchResults[cursor].type === 'Theme') {
          setTheme(SearchResults[cursor].theme)
          setIsOpen(false)
        } else if (SearchResults[cursor].type === 'Navigation') {
          router.push(SearchResults[cursor].href)
        } else if (SearchResults[cursor].type === 'Socials') {
          window.open(SearchResults[cursor].href)
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', clickedEnter)
    return () => {
      window.removeEventListener('keydown', clickedEnter)
    }
  }, [SearchResults, cursor, isOpen, router, setTheme, theme])

  useEffect(() => {
    setCursor(0)
    setButtonOpen(isOpen)
    setResults('')
    setCursorMoved(false)
  }, [isOpen, setButtonOpen])

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <Transition.Root show={isOpen}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <DialogPrimitive.Overlay
            forceMount
            className='fixed inset-0 z-20 bg-white/80 dark:bg-black/80'
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <DialogPrimitive.Content
            forceMount
            className={cn(
              'fixed z-50',
              'w-[95vw]  md:w-full max-w-2xl md:-ml-2 rounded-md shadow-lg',
              'mycenter',
              'myblur border border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 ',
              'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
            )}
          >
            <DialogPrimitive.Title className='w-full p-4 border-b border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 '>
              <input
                value={Results}
                className='w-full text-gray-900 placeholder-gray-500 bg-transparent outline-none dark:placeholder-gray-500 dark:text-gray-100'
                aria-label='Search for links or commands'
                type='text'
                onChange={e => {
                  handleChange(e)
                }}
                placeholder={
                  !cursorMoved
                    ? 'Search for links or commands...'
                    : `${SearchResults.length && SearchResults[cursor].label}`
                }
              />
            </DialogPrimitive.Title>
            <div className='px-3 py-2 max-h-[40vh] md:max-h-[32vh] overflow-y-auto text-gray-600 dark:text-gray-400'>
              <ul>
                {!SearchResults.length && <p>No results found.</p>}

                {SearchResults.some(containsNavigation) && (
                  <span aria-hidden='true' className='text-sm'>
                    Navigation
                  </span>
                )}
                {SearchResults.map((item, index) => {
                  if (item.type === 'Navigation') {
                    return (
                      <li
                        key={index}
                        ref={el => {
                          itemsRef.current[index] = el
                        }}
                        onMouseOver={() => {
                          setCursor(index)
                          setCursorMoved(true)
                        }}
                      >
                        <Link href={item.href}>
                          <a
                            className={cn(
                              'flex items-center focus:outline-none  justify-between p-3 space-x-2 rounded-md ',
                              cursor === index
                                ? `bg-gray-200 ${
                                    samePage(item.href)
                                      ? 'bg-opacity-40 dark:bg-opacity-40 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                      : ''
                                  } dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white`
                                : ''
                            )}
                          >
                            <div className='flex space-x-2'>
                              <div>{item.icon}</div>
                              <div>{item.label}</div>
                            </div>

                            <div
                              className={cn(
                                '',
                                cursor === index
                                  ? 'dark:text-gray-400 text-gray-400'
                                  : 'text-transparent dark:text-transparent'
                              )}
                            >
                              {item.rightText}
                            </div>
                          </a>
                        </Link>
                      </li>
                    )
                  }
                })}

                {SearchResults.some(containsSocial) && (
                  <span aria-hidden='true' className='text-sm'>
                    Socials
                  </span>
                )}
                {SearchResults.map((item, index) => {
                  if (item.type === 'Socials') {
                    return (
                      <li
                        key={index}
                        ref={el => {
                          itemsRef.current[index] = el
                        }}
                        onMouseOver={() => {
                          setCursor(index)
                          setCursorMoved(true)
                        }}
                      >
                        <a
                          href={item.href}
                          className={cn(
                            'flex items-center p-3 justify-between focus:outline-none rounded-md',
                            cursor === index
                              ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                              : ''
                          )}
                        >
                          <div className='flex items-center space-x-2'>
                            <div>{item.icon}</div>
                            <div>{item.label}</div>
                          </div>
                          <div
                            className={cn(
                              '',
                              cursor === index
                                ? 'dark:text-gray-400 text-gray-600'
                                : 'text-transparent dark:text-transparent'
                            )}
                          >
                            {item.rightText}
                          </div>
                        </a>
                      </li>
                    )
                  }
                })}

                {SearchResults.some(containsTheme) && (
                  <span aria-hidden='true' className='text-sm'>
                    Theme
                  </span>
                )}
                {SearchResults.map((item, index) => {
                  if (item.type === 'Theme') {
                    return (
                      <li
                        key={index}
                        className={cn(
                          'flex items-center p-3 justify-between focus:outline-none rounded-md cursor-pointer',
                          cursor === index
                            ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                            : ''
                        )}
                        onClick={() => {
                          setTheme(item.theme)
                          setIsOpen(false)
                          itemsRef.current[index].scrollIntoView({
                            behavior: 'smooth',
                          })
                        }}
                        ref={el => {
                          itemsRef.current[index] = el
                        }}
                        onMouseOver={() => {
                          setCursor(index)
                          setCursorMoved(true)
                        }}
                      >
                        <div className='flex items-center space-x-2'>
                          <div>{item.icon}</div>
                          <div>{item.label}</div>
                        </div>

                        <div
                          className={cn(
                            '',
                            cursor === index
                              ? 'dark:text-gray-400 text-gray-600'
                              : 'text-transparent dark:text-transparent'
                          )}
                        >
                          {item.rightText}
                        </div>
                      </li>
                    )
                  }
                })}
              </ul>
            </div>
          </DialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </DialogPrimitive.Root>
  )
}
