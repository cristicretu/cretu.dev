import { format, parseISO } from 'date-fns';

import Container from './Container';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface BlogComponentProps {
  children?: any;
  frontMatter?: any;
}

const editUrl = (slug) =>
  `https://github.com/cristicretu/cretu.dev/edit/main/data/blog/${slug}.mdx`;

const BlogComponent: React.FC<BlogComponentProps> = ({
  children,
  frontMatter
}) => {
  return (
    <Container
      title={`Cristian Crețu - ${frontMatter.title}`}
      description={frontMatter.summary}
      image={`https://cretu.dev${frontMatter.image}`}
      date={new Date(frontMatter.publishedAt).toString()}
      type="article"
    >
      <Link href="/writing">
        <a className="text-gray-700 hover:text-gray-900 transition transition-duration-200 dark:text-gray-300 dark:hover:text-gray-100">
          <span>←</span> Back
        </a>
      </Link>
      <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb w-full">
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
          {frontMatter.title}
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mt-2">
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

        <div className="prose dark:prose-dark max-w-none w-full mt-4">
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
};

export default BlogComponent;
