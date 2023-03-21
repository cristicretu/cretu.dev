export default function Footer() {
  return (
    <footer className="text-sm text-quaternary mx-auto max-w-2xl px-2 mt-12 pb-24 pt-4 border-t border-gray-200 border-dashed dark:border-gray-700 dark:text-gray-600">
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
    </footer>
  );
}
