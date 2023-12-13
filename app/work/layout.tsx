export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mt-16 flex flex-col space-y-16">
      <div className="flex flex-col space-y-16">
        <h1>Highlights</h1>
        <p className="text-tertiary max-w-2xl">
          Here&apos;s a list of some of the things I&apos;ve worked on,
          including personal projects, open source contributions, and
          professional work.
        </p>
      </div>
      {children}
    </div>
  );
}
