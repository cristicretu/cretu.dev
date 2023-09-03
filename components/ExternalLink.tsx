import { cn } from '@/lib/className';

interface Props {
  arrow?: boolean;
  children: React.ReactNode;
  className?: string;
  href: string;
  underline?: boolean;
}

export default function ExternalLink({
  href,
  children,
  arrow = true,
  underline = true,
  className,
}: Props) {
  return (
    <>
      <a
        className={cn(
          underline
            ? "underline underline-offset-[3px] hover:bg-[url('/static/squiggle.svg')] hover:no-underline"
            : '',
          'text-secondary',
          'inline-block',
          className ? className : '',
        )}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
      <span>
        {arrow && (
          <svg
            className="ml-0.5 inline-block h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </>
  );
}
