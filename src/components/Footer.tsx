export default function Footer() {
  return (
    <footer className="text-quaternary mx-auto max-w-2xl px-8 py-16 text-sm font-mono">
      <div className="flex flex-col gap-2">
        <span>© {new Date().getFullYear()} cretu</span>
        <a
          href="https://github.com/cristicretu/cretu.dev"
          rel="noopener noreferrer"
          target="_blank"
          className="hover:text-secondary transition-colors"
        >
          source code
        </a>
      </div>
    </footer>
  );
}
