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
          className ? className : '',
        )}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
      <span>{arrow && '↗'}</span>
    </>
  );
}
