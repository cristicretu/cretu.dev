// credits:
// https://github.com/ecklf/tailwindcss-radix/blob/main/demo/components/shared/ThemeSwitcher.tsx
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Half2Icon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import React from 'react';

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const themes = [
  {
    key: 'light',
    label: 'Light',
    icon: <SunIcon />
  },
  {
    key: 'dark',
    label: 'Dark',
    icon: <MoonIcon />
  },

  {
    key: 'system',
    label: 'System',
    icon: <Half2Icon />
  }
];

export default function ThemeSwitcher(props) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="relative hidden text-left">
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger
          className={cx(
            'inline-flex justify-center px-2.5 py-2 text-sm font-medium rounded-md select-none',
            'text-gray-900 bg-white hover:bg-gray-50 dark:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700',
            'border border-gray-300 dark:border-gray-600',
            'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
          )}
          aria-label="Change theme"
        >
          {(function () {
            switch (resolvedTheme) {
              case 'light':
                return (
                  <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                );
              case 'dark':
                return (
                  <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                );
              default:
                return (
                  <Half2Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                );
            }
          })()}
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={5}
          className={cx(
            ' radix-side-bottom:animate-slide-down radix-side-top:animate-slide-up',
            'w-48 md:w-56 px-1.5 py-1 rounded-lg shadow-md',
            'myblur'
          )}
        >
          {themes.map(({ key, label, icon }, i) => {
            return (
              <DropdownMenuPrimitive.Item
                key={`theme-${i}`}
                className={cx(
                  'flex items-center w-full  cursor-pointer px-2 py-2 text-xs rounded-md outline-none  select-none',
                  'text-gray-500 focus:bg-gray-200 dark:text-gray-400 dark:focus:bg-gray-800 dark:focus:bg-opacity-30 focus:bg-opacity-20'
                )}
                onClick={() => {
                  setTheme(key);
                }}
              >
                {React.cloneElement(icon, {
                  className: 'w-5 h-5 mr-2 text-gray-700 dark:text-gray-300'
                })}
                <span className="flex-grow text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}
