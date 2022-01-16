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
  label: string;
  href?: string;
  icon: ReactNode;
  type?: 'Navigation' | 'Socials' | 'Theme';
  theme?: 'dark' | 'light' | 'system';
}

const Navigation: CommandMenuProps[] = [
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
  }
];

const Socials: CommandMenuProps[] = [
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
  }
];

const Theme: CommandMenuProps[] = [
  {
    label: 'Change theme to light',
    icon: <SunIcon width={20} height={20} />,
    type: 'Theme',
    theme: 'light'
  },
  {
    label: 'Change theme to dark',
    icon: <MoonIcon width={20} height={20} />,
    type: 'Theme',
    theme: 'dark'
  },
  {
    label: 'Change theme to system',
    icon: <Half2Icon width={20} height={20} />,
    type: 'Theme',
    theme: 'system'
  }
];

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme, theme } = useTheme();

  const router = useRouter();

  const [cursor, setCursor] = useState(0);

  const all = [...Navigation, ...Socials, ...Theme];

  const [Results, setResults] = useState(all);
  // const SearchResults = posts
  //   .sort()
  //   .filter((date) => date.title.toLowerCase().includes(Results.toLowerCase()));

  const handleEnter = (e) => {
    if (e.keyCode === 13 && isOpen) {
      console.log(all[cursor]);
    }
  };

  useEffect(() => {
    const navigated = (e) => {
      if (e.keyCode === 38 && isOpen) {
        setCursor((cursor) => (cursor === 0 ? all.length - 2 : cursor - 1));
      } else if (e.keyCode === 40 && isOpen) {
        setCursor((cursor) => (cursor + 1 > all.length - 2 ? 0 : cursor + 1));
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
  }, [all, cursor, isOpen, setTheme]);

  useEffect(() => {
    setCursor(0);
  }, [isOpen]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger asChild className="visible md:hidden">
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
                // value={Results}
                className="w-full text-gray-900 placeholder-gray-500 bg-transparent outline-none dark:placeholder-gray-500 dark:text-gray-100"
                aria-label="Search for links or commands"
                type="text"
                // onChange={(e) => setResults(e.target.value)}
                placeholder="Search for links or commands..."
              />
            </DialogPrimitive.Title>
            <div className="px-3 py-2 text-gray-600 dark:text-gray-400">
              <ul>
                <span aria-hidden="true" className="text-sm">
                  Navigation
                </span>
                <ul className="flex flex-col space-y-1">
                  {Navigation.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href}>
                        <a
                          className={cn(
                            'flex items-center p-3 space-x-2 transition-all rounded-md',
                            cursor === index
                              ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                              : ''
                          )}
                          onKeyPress={handleEnter}
                          onMouseOver={() => setCursor(index)}
                        >
                          <div>{item.icon}</div>
                          <div>{item.label}</div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
                <span aria-hidden="true" className="text-sm">
                  Socials
                </span>
                <ul className="flex flex-col space-y-1">
                  {Socials.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${item.href} in a new tab`}
                        className={cn(
                          'flex items-center p-3 space-x-2 transition-all rounded-md',
                          cursor === index + Navigation.length
                            ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                            : ''
                        )}
                        onMouseOver={() => setCursor(index + Navigation.length)}
                      >
                        <div>{item.icon}</div>
                        <div>{item.label}</div>
                      </a>
                    </li>
                  ))}
                </ul>
                <span aria-hidden="true" className="text-sm">
                  Theme
                </span>
                <ul className="flex flex-col space-y-1">
                  {(function () {
                    switch (resolvedTheme) {
                      case 'light':
                        return (
                          <li
                            className={cn(
                              'flex items-center p-3 space-x-2 transition-all rounded-md cursor-pointer',
                              cursor === all.length - 3
                                ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                                : ''
                            )}
                            onMouseOver={() => setCursor(all.length - 3)}
                            onClick={() => {
                              setTheme('dark');
                              setIsOpen(false);
                            }}
                          >
                            <MoonIcon
                              className="w-5 h-5 text-gray-700 dark:text-gray-300"
                              width={20}
                              height={20}
                            />
                            <div>Change theme to dark</div>
                          </li>
                        );
                      case 'dark':
                        return (
                          <li
                            className={cn(
                              'flex items-center p-3 space-x-2 transition-all rounded-md cursor-pointer',
                              cursor === all.length - 3
                                ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                                : ''
                            )}
                            onMouseOver={() => setCursor(all.length - 3)}
                            onClick={() => {
                              setTheme('light');
                              setIsOpen(false);
                            }}
                          >
                            <SunIcon
                              className="w-5 h-5 text-gray-700 dark:text-gray-300"
                              width={20}
                              height={20}
                            />
                            <div>Change theme to light</div>
                          </li>
                        );
                    }
                  })()}
                  <li
                    className={cn(
                      'flex items-center p-3 space-x-2 transition-all rounded-md cursor-pointer',
                      cursor === all.length - 2
                        ? 'bg-gray-200 dark:bg-gray-700 dark:bg-opacity-80 text-black dark:text-white'
                        : ''
                    )}
                    onMouseOver={() => setCursor(all.length - 2)}
                    onClick={() => {
                      setTheme('system');
                      setIsOpen(false);
                    }}
                  >
                    <Half2Icon
                      className="w-5 h-5 text-gray-700 dark:text-gray-300"
                      width={20}
                      height={20}
                    />
                    <div>Change theme to system</div>
                  </li>
                </ul>
              </ul>
            </div>
          </DialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </DialogPrimitive.Root>
  );
}
