import { cn } from "@/lib/className";

interface Props {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  underline?: boolean;
  className?: string;
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
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className={cn(
          underline
            ? "underline underline-offset-[3px] hover:no-underline hover:bg-[url('/static/squiggle.svg')]"
            : "",
          "text-secondary",
          className ? className : ""
        )}
      >
        {children}
      </a>
      <span>{arrow && "↗"}</span>
    </>
  );
}
