"use client";

import { Themes, Navigation, Socials } from "@/data/cmd";
import { cn } from "@/lib/className";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  HomeIcon,
  BookOpenIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";
import { GitHubLogo, TwitterLogo } from "./Icons";

export default function Swatch() {
  const [animate, setAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [themeArray, setThemeArray] = useState(Themes);

  // if mounted, filter the theme array to remove the current theme
  const filteredThemeArray = useMemo(() => {
    if (mounted) {
      return themeArray.filter((theme) => theme.keywords !== resolvedTheme);
    }
    return themeArray;
  }, [mounted, resolvedTheme, themeArray]);

  useEffect(() => setMounted(true), []);
  return (
    <motion.div
      initial={{ opacity: 0, x: -100, scale: 0.9 }}
      animate={{
        opacity: mounted ? 1 : 0.9,
        x: mounted ? 0 : -100,
        scale: mounted ? 1 : 0.9,
      }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setAnimate(true)}
      onHoverEnd={() => setAnimate(false)}
      className=" w-fit text-white font-semibold  tracking-tight"
    >
      <motion.div className="absolute z-10 flex flex-col items-center bg-gray-200 dark:bg-gray-800 w-fit space-y-2 rounded-t-2xl rounded-xl p-1.5">
        {Navigation.map((item, index) => (
          <Link
            key={index}
            href={item.href!}
            className={cn(
              "p-2 w-12 h-14 flex flex-col items-center space-y-1 cursor-pointer transition-all duration-200",
              index === 0 ? "rounded-t-xl rounded-b-lg" : "rounded-lg",
              index === 0 ? "bg-[#7786FE]" : "bg-[#9CB7FF]",
              "hover:bg-opacity-80 transition-all duration-200"
            )}
          >
            {item.keywords === "home" && <HomeIcon className="w-6 h-6" />}
            {item.keywords === "writing" && (
              <BookOpenIcon className="w-6 h-6" />
            )}
            <span className="text-xs select-none">{item.name}</span>
          </Link>
        ))}
        <div className="bg-[#ADC9FA] p-2 w-12 h-14 flex flex-col items-center justify-center cursor-crosshair rounded-b-xl rounded-t-lg">
          ⌘
        </div>
      </motion.div>

      <AnimatePresence>
        (animate && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: 0, x: 0, y: 0 }}
          animate={{
            opacity: animate ? 1 : 0,
            scale: animate ? 1 : 0,
            rotate: animate ? 45 : 0,
            x: animate ? 65 : 0,
            y: animate ? 5 : 0,
          }}
          exit={{ opacity: 0, scale: 0, rotate: 0, x: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="absolute top-0 left-0 right-0 flex flex-col items-center bg-gray-200 dark:bg-gray-800 w-fit space-y-2 rounded-t-2xl rounded-xl p-1.5"
        >
          {Socials.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                item.perform?.();
              }}
              className={cn(
                "p-2 w-12 h-14 flex flex-col items-center space-y-1 cursor-pointer transition-all duration-200",
                index === 0 ? "rounded-t-xl rounded-b-lg" : "rounded-lg",
                index === 0 ? "bg-[#CC697D]" : "bg-[#E19DC2]",
                "hover:bg-opacity-80 transition-all duration-200"
              )}
            >
              {item.keywords === "github" && <GitHubLogo />}
              {item.keywords === "twitter" && <TwitterLogo />}{" "}
              <span className="text-xs select-none">{item.name}</span>
            </div>
          ))}
          <div className="w-12 h-14 "></div>
        </motion.div>
        ))
      </AnimatePresence>

      <AnimatePresence>
        (animate && mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: 0, x: 0, y: 0 }}
          animate={{
            opacity: animate ? 1 : 0,
            scale: animate ? 1 : 0,
            rotate: animate ? 90 : 0,
            x: animate ? 70 : 0,
            y: animate ? 69 : 0,
          }}
          exit={{
            opacity: 0,
            scale: 0,
            rotate: 0,
            x: 0,
            y: 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="absolte top-0 left-0 right-0 flex flex-col items-center bg-gray-200 dark:bg-gray-800 w-fit space-y-2 rounded-t-2xl rounded-xl p-1.5"
        >
          {filteredThemeArray.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => setTheme(item.keywords!)}
                className={cn(
                  "p-2 w-12 h-14 flex flex-col items-center space-y-1 cursor-pointer transition-all duration-200",
                  index === 0 ? "rounded-t-xl rounded-b-lg" : "rounded-lg",
                  index === 0 ? "bg-[#BC7BFD]" : "bg-[#D5ACFF]",
                  "hover:bg-opacity-80 transition-all duration-200"
                )}
              >
                {item.keywords === "light" && <SunIcon className="w-6 h-6" />}
                {item.keywords === "dark" && <MoonIcon className="w-6 h-6" />}
                {item.keywords === "system" && (
                  <ComputerDesktopIcon className="w-6 h-6" />
                )}
                <span className="text-xs select-none touch-none">
                  {item.name}
                </span>
              </div>
            );
          })}
          <div className="w-12 h-14"></div>
        </motion.div>
        )
      </AnimatePresence>
    </motion.div>
  );
}
