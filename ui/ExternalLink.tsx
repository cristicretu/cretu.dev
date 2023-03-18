import { cn } from "@/lib/className";

interface Props {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  underline?: boolean;
}

export default function ExternalLink({
  href,
  children,
  arrow = true,
  underline = true,
}: Props) {
  return (
    <>
      <a
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className={cn(
          underline
            ? "underline underline-offset-[3px] hover:no-underline hover:bg-[url('https://snippets.alexandru.so/squiggle.svg')]"
            : ""
        )}
      >
        {children}
      </a>
      <span>{arrow && "↗"}</span>
    </>
  );
}
