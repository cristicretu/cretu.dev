import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useTheme } from 'next-themes'
import Image from 'next/image'

interface Props {
  href: string
  children?: React.ReactNode
  arrow?: boolean
}

// https://github.com/Pondorasti/alexandru/blob/main/components/LinkPreview/LinkPreview.tsx
export default function ExternalLink({
  href,
  children,
  arrow = false,
  ...props
}: React.ComponentProps<'a'> & Props) {
  const { resolvedTheme } = useTheme()

  const shimmer = (w: number, h: number, theme?: string) => `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect id="r" width="${w}" height="${h}" fill="${
    theme === 'dark' ? '#171717' : '#e2e8f0'
  }" />
    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
  </svg>`

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)

  const sanitizedHref = href
    .replace(/:/g, '%3A')
    .replace(/\//g, '%2F')
    .replace(/#/g, '%23')

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Open ${href} in a new tab.`}
            {...props}
          >
            <span
              className={
                arrow
                  ? `relative after:absolute after:bg-gray-400 after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300`
                  : ''
              }
            >
              {children}
              {arrow && ' ↗'}
            </span>
          </a>
        </TooltipPrimitive.Trigger>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
