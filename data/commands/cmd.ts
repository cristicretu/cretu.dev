export type Action = {
  name?: string
  shortcut?: string[]
  keywords?: string
  section?: 'Navigation' | 'Socials' | 'Themes'
  icon?: string | React.ReactElement | React.ReactNode
  subtitle?: string
  perform?: () => void
}

export const Navigation: Action[] = [
  {
    name: 'Home',
    keywords: 'home',
    perform: () => (window.location.href = '/'),
    section: 'Navigation',
  },
  {
    name: 'Writing',
    keywords: 'writing',
    perform: () => (window.location.href = '/writing'),
    section: 'Navigation',
  },
]

export const Socials: Action[] = [
  {
    name: 'Twitter',
    keywords: 'twitter',
    perform: () => {
      window.location.href = 'https://twitter.com/cristicrtu'
    },
    section: 'Socials',
  },
  {
    name: 'GitHub',
    keywords: 'github',
    perform: () => {
      window.location.href = 'https://github.com/cristicretu'
    },
    section: 'Socials',
  },
]

export const Themes: Action[] = [
  {
    name: 'Change theme to light',
    keywords: 'light',
    perform: () => {
      document.body.classList.remove('dark')
    },
    section: 'Themes',
  },
  {
    name: 'Change theme to dark',
    keywords: 'dark',
    perform: () => {
      document.body.classList.add('dark')
    },
    section: 'Themes',
  },
  {
    name: 'Change theme to system',
    keywords: 'system',
    perform: () => {
      document.body.classList.toggle('dark')
    },
    section: 'Themes',
  },
]
