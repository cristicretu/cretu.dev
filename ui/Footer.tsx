export default function Footer() {
  return (
    <footer className="text-quaternary border-gray-200pb-24 mx-auto mt-12 max-w-2xl border-t border-dashed pt-4 text-sm dark:border-gray-700 dark:text-gray-600">
      © Cristian Crețu {new Date().getFullYear()}. Website built using Next.js &
      TailwindCSS (
      <a
        href="https://github.com/cristicretu/cretu.dev"
        rel="noopener noreferrer"
        target="_blank"
      >
        view source
      </a>
      ).
    </footer>
  );
}
