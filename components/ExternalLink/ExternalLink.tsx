import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface Props {
  href: string
  children?: React.ReactNode
  arrow?: boolean
}

export default function ExternalLink({
  href,
  children,
  arrow = false,
  ...props
}: React.ComponentProps<'a'> & Props) {
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
            <span>
              {children}
              {arrow && ' ↗'}
            </span>
          </a>
        </TooltipPrimitive.Trigger>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
