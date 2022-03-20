import Link from 'next/link'
import { useRouter } from 'next/router'

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function NavItem({ myHref, text }) {
  const router = useRouter()
  const isActive = router.asPath === myHref

  return (
    <Link href={myHref}>
      <a
        className={cn(
          ' hidden md:inline-block sm:px-3 sm:py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all',
          isActive
            ? 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-normal'
        )}
      >
        {text}
      </a>
    </Link>
  )
}
