// Implemented from
// https://github.com/Pondorasti/alexandru/blob/main/components/LinkPreview/LinkPreview.tsx
//
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useTheme } from 'next-themes'
import Image from 'next/image'

function cn(...args) {
  return args.filter(Boolean).join(' ')
}

interface Props {
  href?: string
  children?: React.ReactNode
  className?: string
  customLine?: boolean
}

export default function ExternalLink({
  href,
  children,
  customLine = true,
  ...props
}: React.ComponentProps<'a'> & Props): JSX.Element {
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
            rel='noreferrer'
            aria-label={`Open ${href} in a new tab`}
            {...props}
          >
            <span
              className={cn(customLine ? 'custom-hover' : '', 'cursor-arrow')}
            >
              {children}
            </span>
            <span className=' cursor-arrow'>↗</span>
          </a>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side='top'
          sideOffset={16}
          className='w-64 h-40 p-2 bg-white border rounded-lg border-divider dark:bg-gray-900 animate-slide-in radix-state-closed:animate-slide-out'
        >
          <Image
            src={`https://api.microlink.io?url=${sanitizedHref}&screenshot=true&meta=false&colorScheme=${
              resolvedTheme === 'dark' ? 'dark' : 'light'
            }&embed=screenshot.url`}
            alt=''
            className='p-2 overflow-hidden rounded-md'
            width={240}
            height={144}
            placeholder='blur'
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
              shimmer(240, 144, resolvedTheme)
            )}`}
            objectFit='cover'
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

{
  /* 



*/
}
