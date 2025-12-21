'use client';

import { actions } from '@/data/cmd';
import { cn } from '@/lib/className';
import {
  HomeIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  SunIcon,
  SparklesIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function RollingMenu() {
  const [expanded, setExpanded] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const ref = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
    } else {
      setThemeState('system');
    }
  }, []);

  // Get the resolved theme (what's actually showing)
  const getResolvedTheme = () => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return theme;
  };

  const resolvedTheme = getResolvedTheme();

  const memoizedActions = actions.filter((action) => {
    if (action.section === 'Themes') {
      return action.keywords !== resolvedTheme;
    }
    return true;
  });

  const handleClick = () => {
    setExpanded(!expanded);
  };

  const changeTheme = (newTheme: string) => {
    if (newTheme === 'light') {
      setThemeState('light');
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'dark') {
      setThemeState('dark');
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      setThemeState('system');
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, rotate: -360, scale: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        bounce: 0.5,
        damping: 10,
        delay: i * 0.05,
        type: 'spring',
      },
      x: 0,
    }),
  };

  useEffect(() => {
    if (!expanded) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (ref.current?.contains(target)) return;

      setExpanded(false);
    };

    const scrolled = () => {
      setExpanded(false);
    };

    window.addEventListener('click', handleOutsideClick, { passive: true });
    window.addEventListener('scroll', scrolled, { passive: true });

    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', scrolled);
    };
  }, [expanded]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && expanded) {
        event.preventDefault();
      } else if (event.key === 'ArrowDown' && expanded) {
        event.preventDefault();
      } else if (event.key === 'Enter' && expanded) {
        // highlightedTab?.click();
      } else if (event.key === 'k' && event.metaKey) {
        event.preventDefault();
        setExpanded(!expanded);
      } else if (event.key === 'Escape') {
        setExpanded(false);
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  });

  return (
    <div className="flex items-center" ref={ref}>
      <motion.button
        animate={{ rotate: expanded ? 45 : 0 }}
        aria-label="Navigation Menu"
        className="h-10 w-10 select-none items-center rounded-full bg-black p-3 dark:bg-white"
        onClick={handleClick}
        whileTap={{ scale: 1.1 }}
      >
        <PlusIcon className="h-6 w-6 text-white dark:text-black" />
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div className="flex space-x-2">
            {memoizedActions.map((action, i) => (
              <motion.div
                animate="visible"
                className="mx-0.5"
                custom={i}
                exit="hidden"
                initial="hidden"
                key={i}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
                tabIndex={-1}
                transition={{ bounce: 0.5, damping: 10, type: 'spring' }}
                variants={itemVariants}
                whileTap={{
                  scale: 1.1,
                  transition: {
                    duration: 0.4,
                    ease: [0.25, 1, 0.5, 1],
                    type: 'tween',
                  },
                }}
              >
                <Comp
                  as={
                    action.section === 'Navigation'
                      ? 'a'
                      : action.section === 'Socials'
                      ? 'a'
                      : 'button'
                  }
                  className={cn(
                    'flex h-10 w-10 cursor-pointer select-none flex-col items-center space-y-1 p-3 transition-all duration-200',
                    'rounded-full',
                  )}
                  style={{ backgroundColor: action.color }}
                  href={action.href ?? undefined}
                  key={i}
                  onClick={
                    action.section === 'Themes'
                      ? () => changeTheme(action.keywords!)
                      : undefined
                  }
                  rel={
                    action.section === 'Socials'
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  tabIndex={0}
                  target={action.section === 'Socials' ? '_blank' : undefined}
                >
                  {action.keywords === 'home' && (
                    <HomeIcon
                      className="h-6 w-6"
                      style={{ color: action.iconColor }}
                    />
                  )}
                  {action.keywords === 'writing' && (
                    <PencilIcon
                      className="h-6 w-6"
                      style={{ color: action.iconColor }}
                    />
                  )}
                  {action.keywords === 'highlights' && (
                    <SparklesIcon
                      className="h-6 w-6"
                      style={{ color: action.iconColor }}
                    />
                  )}
                  {action.keywords === 'light' && (
                    <SunIcon
                      className="h-6 w-6"
                      style={{ color: action.iconColor }}
                    />
                  )}
                  {action.keywords === 'dark' && (
                    <MoonIcon
                      className="h-6 w-6"
                      style={{ color: action.iconColor }}
                    />
                  )}
                  {action.keywords === 'system' && (
                    <ComputerDesktopIcon
                      className="h-6 w-6"
                      style={{ color: action.iconColor }}
                    />
                  )}
                </Comp>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Comp({
  as,
  children,
  ...props
}: {
  [key: string]: any;
  as: any;
  children: React.ReactNode;
}): JSX.Element {
  const Component = as;
  return <Component {...props}>{children}</Component>;
}
