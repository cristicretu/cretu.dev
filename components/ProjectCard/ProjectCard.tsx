import React from 'react'

import { GitHubLogoIcon } from '@radix-ui/react-icons'

import ExternalLink from '@components/ExternalLink'
import { classNames } from '@lib/classNames'

interface ProjectCardProps {
  url?: string
  github?: string
  title: string
  description: string
}

export default function ProjectCard({
  url,
  github,
  title,
  description,
}: ProjectCardProps): JSX.Element {
  return (
    <div>
      <p
        className={classNames(
          'font-serif flex items-center space-x-1 text-black dark:text-white',
          'text-md'
        )}
      >
        {url && <ExternalLink href={url}>{title}</ExternalLink>}
        {!url && title && <>{title}</>}
        {github && (
          <a href={github} target='_blank' rel='noreferrer' aria-label='GitHub'>
            <GitHubLogoIcon className='w-4 h-auto text-gray-900 transition-all duration-200 fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-opacity-40 hover:text-opacity-100' />
          </a>
        )}
      </p>
      <p>{description}</p>
    </div>
  )
}
