export default function Container({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className='relative flex h-full min-h-screen w-full'>{children}</div>
  )
}
