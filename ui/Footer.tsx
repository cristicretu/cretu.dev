export default function Footer() {
  return (
    <p className="text-sm text-quaternary mx-auto max-w-2xl px-2">
      © Cristian Crețu {new Date().getFullYear()}. Website built using Next.js &
      TailwindCSS (
      <a
        href="https://github.com/cristicretu/cretu.dev"
        target="_blank"
        rel="noopener noreferrer"
      >
        view source
      </a>
      ).
    </p>
  );
}
