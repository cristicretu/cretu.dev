import React from 'react'

interface Command {
  label: string
  href?: string
  icon?: React.ReactNode
  onExecute: (args: string[]) => void
}

export const commands: Command[] = [
  {
    label: 'Home',
    href: '/',
    onExecute: () => {
      window.location.href = '/'
    },
  },
  {
    label: 'Writing',
    href: '/writing',
    onExecute: () => {
      window.location.href = '/writing'
    },
  },
]
