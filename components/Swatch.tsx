'use client';

import { GitHubLogo, TwitterLogo } from './Icons';
import { Themes, Navigation, Socials } from '@/data/cmd';
import { cn } from '@/lib/className';
import {
  HomeIcon,
  BookOpenIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/solid';
import {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Swatch() {
  const [animate, setAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef(null);
  const [relativeConstraints, setRelativeConstraints] = useState({
    left: 0,
    right: 0,
  });
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-90, 90]);

  // if mounted, filter the theme array to remove the current theme
  const filteredThemeArray = useMemo(() => {
    if (mounted) {
      return Themes.filter((theme) => theme.keywords !== resolvedTheme);
    }
    return Themes;
  }, [mounted, resolvedTheme]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (ref.current) {
      const rect = (ref.current as any).getBoundingClientRect();
      const halfWidth = rect.width / 2;
      setRelativeConstraints({
        left: -halfWidth,
        right: halfWidth,
      });
    }

    const handleScroll = () => {
      if (isFocused) setIsFocused(false);
    };

    const handleClickOutside = (event: { target: any }) => {
      if (
        isFocused &&
        ref.current &&
        !(ref.current as any).contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFocused, ref]);

  const handleDrag = (_: any, info: { point: { x: number } }) => {
    const isFullyVisible = info.point.x >= relativeConstraints.right;
    setIsFocused(isFullyVisible);
  };

  useEffect(() => {
    if (animate && !isFocused) {
      setAnimate(false);
    }
  }, [animate, isFocused]);

  if (!mounted) return null;

  return (
    <motion.div
      animate={controls}
      className=" w-fit  font-semibold  tracking-tight text-white"
      drag="x"
      dragConstraints={{ left: -50, right: 0 }}
      dragElastic={0.5}
      dragTransition={{ bounceDamping: 20, bounceStiffness: 600 }}
      exit={{ opacity: 0, scale: 0.9 }}
      id="swatch"
      initial={{ opacity: 0.3, scale: 1, x: relativeConstraints.left }}
      onDrag={handleDrag}
      // onHoverEnd={() => {
      //   const isMobile = window.innerWidth < 768; //Add the width you want to check for here (now 768px)
      //   if (isMobile) return;
      //   setIsFocused(false);
      //   setAnimate(false);
      // }}
      // onHoverStart={() => {
      //   const isMobile = window.innerWidth < 768; //Add the width you want to check for here (now 768px)

      //   if (isMobile) return;
      //   setIsFocused(true);
      //   setAnimate(true);
      // }}
      ref={ref}
      transition={{ duration: 0.2 }}
      whileTap={{ cursor: 'grabbing' }}
    >
      <motion.div className="absolute z-10 flex w-fit flex-col items-center space-y-2 rounded-xl rounded-t-2xl bg-gray-200 p-1.5 dark:bg-gray-800">
        {Navigation.map((item, index) => (
          <Link
            className={cn(
              'flex h-14 w-12 cursor-pointer flex-col items-center space-y-1 p-2 transition-all duration-200',
              index === 0 ? 'rounded-t-xl rounded-b-lg' : 'rounded-lg',
              index === 0 ? 'bg-[#7786FE]' : 'bg-[#9CB7FF]',
              'transition-all duration-200 hover:bg-opacity-80',
            )}
            href={!isFocused ? '' : item.href!}
            key={index}
          >
            {item.keywords === 'home' && <HomeIcon className="h-6 w-6" />}
            {item.keywords === 'writing' && (
              <BookOpenIcon className="h-6 w-6" />
            )}
            <span className="select-none text-xs">{item.name}</span>
          </Link>
        ))}
        <div
          className="flex h-14 w-12 cursor-crosshair select-none flex-col items-center justify-center rounded-b-xl rounded-t-lg bg-[#ADC9FA] p-2"
          onClick={() => {
            const isMobile = window.innerWidth < 768; //Add the width you want to check for here (now 768px)

            if (!isMobile) return;

            setAnimate(!animate);
          }}
        >
          ⌘
        </div>
      </motion.div>

      <AnimatePresence>
        (animate && (
        <motion.div
          animate={{
            opacity: animate ? 1 : 0,
            // rotate: animate ? 45 : 0,
            scale: animate ? 1 : 0,
            // x: animate ? 65 : 0,
            y: animate ? 5 : 0,
          }}
          className="absolute top-0 left-0 right-0 flex w-fit flex-col items-center space-y-2 rounded-xl rounded-t-2xl bg-gray-200 p-1.5 dark:bg-gray-800"
          exit={{ opacity: 0, rotate: 0, scale: 0, x: 0, y: 0 }}
          initial={{ opacity: 0, rotate: 0, scale: 0, x: 0, y: 0 }}
          style={{ rotate }}
          transition={{ damping: 18, stiffness: 400, type: 'spring' }}
        >
          {Socials.map((item, index) => (
            <div
              className={cn(
                'flex h-14 w-12 cursor-pointer flex-col items-center space-y-1 p-2 transition-all duration-200',
                index === 0 ? 'rounded-t-xl rounded-b-lg' : 'rounded-lg',
                index === 0 ? 'bg-[#CC697D]' : 'bg-[#E19DC2]',
                'transition-all duration-200 hover:bg-opacity-80',
              )}
              key={index}
              onClick={() => {
                item.perform?.();
              }}
            >
              {item.keywords === 'github' && <GitHubLogo />}
              {item.keywords === 'twitter' && <TwitterLogo />}{' '}
              <span className="select-none text-xs">{item.name}</span>
            </div>
          ))}
          <div className="h-14 w-12 "></div>
        </motion.div>
        ))
      </AnimatePresence>

      <AnimatePresence>
        (animate && mounted && (
        <motion.div
          animate={{
            opacity: animate ? 1 : 0,
            // rotate: animate ? 90 : 0,
            scale: animate ? 1 : 0,
            // x: animate ? 70 : 0,
            y: animate ? 69 : 0,
          }}
          className="absolte top-0 left-0 right-0 flex w-fit flex-col items-center space-y-2 rounded-xl rounded-t-2xl bg-gray-200 p-1.5 dark:bg-gray-800"
          exit={{
            opacity: 0,
            rotate: 0,
            scale: 0,
            x: 0,
            y: 0,
          }}
          initial={{ opacity: 0, rotate: 0, scale: 0, x: 0, y: 0 }}
          style={{ rotate }}
          transition={{ damping: 18, stiffness: 400, type: 'spring' }}
        >
          {filteredThemeArray.map((item, index) => {
            return (
              <div
                className={cn(
                  'flex h-14 w-12 cursor-pointer flex-col items-center space-y-1 p-2 transition-all duration-200',
                  index === 0 ? 'rounded-t-xl rounded-b-lg' : 'rounded-lg',
                  index === 0 ? 'bg-[#BC7BFD]' : 'bg-[#D5ACFF]',
                  'transition-all duration-200 hover:bg-opacity-80',
                )}
                key={index}
                onClick={() => setTheme(item.keywords!)}
              >
                {item.keywords === 'light' && <SunIcon className="h-6 w-6" />}
                {item.keywords === 'dark' && <MoonIcon className="h-6 w-6" />}
                {item.keywords === 'system' && (
                  <ComputerDesktopIcon className="h-6 w-6" />
                )}
                <span className="touch-none select-none text-xs">
                  {item.name}
                </span>
              </div>
            );
          })}
          <div className="h-14 w-12"></div>
        </motion.div>
        )
      </AnimatePresence>
    </motion.div>
  );
}
