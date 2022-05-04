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
