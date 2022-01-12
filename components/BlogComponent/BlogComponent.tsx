import { format, parseISO } from 'date-fns';

import Container from '../Container/Container';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface BlogComponentProps {
  children?: any;
  frontMatter?: any;
}

const editUrl = (slug) =>
  `https://github.com/cristicretu/cretu.dev/edit/main/data/blog/${slug}.mdx`;

export default function BlogComponent({
  children,
  frontMatter
}: BlogComponentProps): JSX.Element {
  return (
    <Container
      title={`Cristian Crețu - ${frontMatter.title}`}
      description={frontMatter.summary}
      image={`https://cretu.dev${frontMatter.image}`}
      date={new Date(frontMatter.publishedAt).toString()}
      type="article"
    >
      <Link href="/writing">
        <a className="text-gray-700 transition hover:text-gray-900 transition-duration-200 dark:text-gray-300 dark:hover:text-gray-100">
          <span>←</span> Back
        </a>
      </Link>
      <article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
          {frontMatter.title}
        </h1>
        <div className="flex flex-col items-start justify-between w-full mt-2 md:flex-row md:items-center">
          <div className="flex items-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Cristian Crețu
              {` • `}
              {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
              {` • `}
              {frontMatter.readingTime.text}
            </p>
          </div>
        </div>
        <br></br>
        {frontMatter.image && (
          <Image
            src={frontMatter.image}
            width={1440}
            height={1024}
            layout="intrinsic"
            alt="blog-image"
            className="rounded-lg"
          ></Image>
        )}

        <div className="w-full mt-4 prose dark:prose-dark max-w-none">
          {children}
        </div>
        <div className="mx-auto mt-2 text-gray-700 dark:text-gray-300">
          <a
            href={editUrl(frontMatter.slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="custom-underline">Edit source on Github </span>{' '}
            <span className="arrow">&#8599;</span>
          </a>
        </div>
      </article>
    </Container>
  );
}
