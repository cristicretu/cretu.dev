import { GitHubLogoIcon } from "@radix-ui/react-icons"
import React from 'react'

interface ProjectCardProps {
  url?: string,
  github?: string,
  title: string,
  description: string,
  type?: string,
}

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ url, github, title, description, type }) => {
  return (
    <div>
      <p className={cx("font-bold flex items-center space-x-1 text-black dark:text-white", type === "small" ? "text-md" : "text-lg")}>
        <span>
          <a href={url}
            target="_blank"
            rel="noreferrer"
            aria-label="Website"
            className="custom-underline">
            {title}
          </a>
          <span className='cursor-arrow  font-normal text-sm'>&#8599;</span>
        </span>
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          aria-label="Github"
        >
          <GitHubLogoIcon className="fill-current dark:text-white dark:text-opacity-40 dark:hover:text-opacity-100 text-gray-900
          text-opacity-40 hover:text-opacity-100 transition-all duration-200 w-4 pt-1 h-auto" />
        </a>
      </p>
      <p>{description}</p>
    </div>
  );
}
