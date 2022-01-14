export default function ExternalLink({
  href,
  children,
  className,
  ...props
}: React.ComponentProps<'a'>): JSX.Element {
  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${href} in a new tab`}
        className="custom-hover cursor-arrow"
        {...props}
      >
        {children}
      </a>
      <span className=" cursor-arrow">↗</span>
    </>
  );
}
