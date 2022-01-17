import * as DialogPrimitive from '@radix-ui/react-dialog';

import {
  ArrowRightIcon,
  GitHubLogoIcon,
  Half2Icon,
  MoonIcon,
  SunIcon,
  TwitterLogoIcon
} from '@radix-ui/react-icons';
import React, { Fragment, ReactNode, useEffect, useState } from 'react';

import Link from 'next/link';
import { Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface CommandMenuProps {
  label?: string;
  href?: string;
  icon?: ReactNode;
  type?: 'Navigation' | 'Socials' | 'Theme';
  theme?: 'dark' | 'light' | 'system';
}

interface Props {
  buttonOpen: boolean;
  setButtonOpen: (open: boolean) => void;
}

export default function CommandMenu({ buttonOpen, setButtonOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme, theme } = useTheme();

  const router = useRouter();

  const all: CommandMenuProps[] = [
    {
      label: 'Home',
      href: '/',
      icon: <ArrowRightIcon width={20} height={20} />,
      type: 'Navigation'
    },
    {
      label: 'Writing',
      href: '/writing',
      icon: <ArrowRightIcon width={20} height={20} />,
      type: 'Navigation'
    },
    {
      label: 'Github',
      href: 'https://github.com/cristicretu',
      icon: <GitHubLogoIcon width={20} height={20} />,
      type: 'Socials'
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/cristicrtu',
      icon: <TwitterLogoIcon width={20} height={20} />,
      type: 'Socials'
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
      theme: resolvedTheme === 'light' ? 'dark' : 'light'
    },
    {
      label: 'Change theme to system',
      icon: <Half2Icon width={20} height={20} />,
      type: 'Theme',
      theme: 'system'
    }
  ];

  const [cursor, setCursor] = useState(0);

  const [Results, setResults] = useState('');
  const SearchResults = all
    .sort()
    .filter((item) => item.label.toLowerCase().includes(Results.toLowerCase()));

  const handleChange = (e) => {
    setResults(e.target.value);
    setCursor(all.indexOf(SearchResults[0]));
  };

  const samePage = (href) => {
    return href === router.pathname;
  };

  function containsSocial(element, index, array) {
    return element.type === 'Socials';
  }

  function containsTheme(element, index, array) {
    return element.type === 'Theme';
  }

  function containsNavigation(element, index, array) {
    return element.type === 'Navigation';
  }

  useEffect(() => {
    setIsOpen(buttonOpen);
  }, [buttonOpen, setButtonOpen]);

  useEffect(() => {
    const navigated = (e) => {
      if (e.keyCode === 38 && isOpen) {
        setCursor((cursor) => (cursor === 0 ? all.length - 1 : cursor - 1));
      } else if (e.keyCode === 40 && isOpen) {
        setCursor((cursor) => (cursor + 1 > all.length - 1 ? 0 : cursor + 1));
      }
    };

    window.addEventListener('keydown', navigated);
    return () => {
      window.removeEventListener('keydown', navigated);
    };
  });

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

  useEffect(() => {
    const clickedEnter = (e) => {
      if (e.keyCode === 13 && isOpen) {
        if (all[cursor].type === 'Theme') {
          setTheme(all[cursor].theme);
          setIsOpen(false);
        } else if (all[cursor].type === 'Navigation') {
          router.push(all[cursor].href);
        } else if (all[cursor].type === 'Socials') {
          window.open(all[cursor].href);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', clickedEnter);
    return () => {
      window.removeEventListener('keydown', clickedEnter);
    };
  }, [all, cursor, isOpen, router, setTheme, theme]);

  useEffect(() => {
    setCursor(0);
    setButtonOpen(isOpen);
  }, [isOpen, setButtonOpen]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogPrimitive.Trigger asChild className="visible md:hidden">
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
      </DialogPrimitive.Trigger> */}
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
            className="fixed inset-0 z-20 bg-white/80 dark:bg-black/80"
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
              'w-[95vw] overflow-auto md:w-full max-w-2xl md:-ml-2 rounded-md shadow-lg',
              'mycenter',
              'myblur border border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 ',
              'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
            )}
          >
            <DialogPrimitive.Title className="w-full p-4 border-b border-black dark:border-gray-100 dark:border-opacity-20 border-opacity-20 ">
              <input
                value={Results}
                className="w-full text-gray-900 placeholder-gray-500 bg-transparent outline-none dark:placeholder-gray-500 dark:text-gray-100"
                aria-label="Search for links or commands"
                type="text"
                onChange={(e) => {
                  handleChange(e);
                }}
                placeholder="Search for links or commands..."
              />
            </DialogPrimitive.Title>
            <div className="px-3 py-2 text-gray-600 dark:text-gray-400">
              <ul>
                {!SearchResults.length && <p>No results found.</p>}

                {SearchResults.some(containsNavigation) && (
                  <span aria-hidden="true" className="text-sm">
                    Navigation
                  </span>
                )}
                {SearchResults.map((item, index) => {
                  if (item.type === 'Navigation') {
                    return (
                      <li key={index}>
                        <Link href={item.href}>
                          <a
                            className={cn(
                              'flex items-center p-3 space-x-2 transition-all rounded-md ',
                              cursor === index
                                ? `bg-gray-200 ${
                                    samePage(item.href)
                                      ? 'bg-opacity-40 dark:bg-opacity-40 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                      : ''
                                  } dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white`
                                : ''
                            )}
                            onMouseOver={() => setCursor(index)}
                          >
                            <div>{item.icon}</div>
                            <div>{item.label}</div>
                          </a>
                        </Link>
                      </li>
                    );
                  }
                })}

                {SearchResults.some(containsSocial) && (
                  <span aria-hidden="true" className="text-sm">
                    Socials
                  </span>
                )}
                {SearchResults.map((item, index) => {
                  if (item.type === 'Socials') {
                    return (
                      <li key={index}>
                        <a
                          href={item.href}
                          className={cn(
                            'flex items-center p-3 space-x-2 transition-all rounded-md',
                            cursor === index
                              ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                              : ''
                          )}
                          onMouseOver={() => setCursor(index)}
                        >
                          <div>{item.icon}</div>
                          <div>{item.label}</div>
                        </a>
                      </li>
                    );
                  }
                })}

                {SearchResults.some(containsTheme) && (
                  <span aria-hidden="true" className="text-sm">
                    Theme
                  </span>
                )}
                {SearchResults.map((item, index) => {
                  if (item.type === 'Theme') {
                    return (
                      <li key={index}>
                        <a
                          href={item.href}
                          className={cn(
                            'flex items-center p-3 space-x-2 transition-all rounded-md cursor-pointer',
                            cursor === index
                              ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                              : ''
                          )}
                          onClick={() => {
                            setTheme(item.theme);
                            setIsOpen(false);
                          }}
                          onMouseOver={() => setCursor(index)}
                        >
                          <div>{item.icon}</div>
                          <div>{item.label}</div>
                        </a>
                      </li>
                    );
                  }
                })}
              </ul>
            </div>
          </DialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </DialogPrimitive.Root>
  );
}
