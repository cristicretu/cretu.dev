import Link from 'next/link';
import React from 'react'

interface BlogPostProps {
  title: string,
  summary: string,
  slug: string,
  type?: string,
}

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const BlogPost: React.FC<BlogPostProps> = ({ title, summary, slug, type }) => {
  return <>
    <Link href={`/writing/${slug}`}>
      <a className="w-full space-x-2 flex items-center rounded-md ">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between">
            <p className={cx(" font-bold text-black dark:text-white", type === "small" ? "text-md" : "text-lg")}>
              {title}
            </p>
          </div>
          <p className="max-w-2xl">{summary}</p>
        </div>
      </a>
    </Link>
  </>
}

export default BlogPost
