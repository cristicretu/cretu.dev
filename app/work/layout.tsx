export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="columns-3 gap-4">{children}</div>;
}
