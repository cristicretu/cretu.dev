import { allWritings } from '.contentlayer/generated';
import { cn } from '@/lib/className';
import DateViewer from '@/ui/DateView';
import { pick } from 'contentlayer/client';
import type { Writing } from 'contentlayer/generated';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description: 'A place where I share ideas about design and code.',
  title: 'Writing',
};

async function getData() {
  const posts = allWritings
    .map((post) => pick(post, ['slug', 'title', 'summary', 'publishedAt']))
    .sort(
      (a, b) =>
        Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt)),
    );

  return {
    props: {
      posts,
    },
  };
}

export default async function Writing() {
  const { posts } = (await getData()).props;
  return (
    <div className="mx-auto max-w-2xl space-y-16">
      <h1>Writing</h1>
      <p className="text-tertiary">
        If you&apos;re interested in exploring the articles that inspire me and
        shape my thinking, check out{' '}
        <Link className="underline " href={'/resources'}>
          Resources
        </Link>
        .
      </p>
      <div className="space-y-2">
        {posts.map((post) => (
          <Link
            className={cn(
              '-mx-2 flex flex-row justify-between rounded-md px-2 py-2',
              'hover:bg-gray-200 dark:hover:bg-gray-800',
              'transition-all duration-200',
            )}
            href={`/writing/${post.slug}`}
            key={post.slug}
          >
            <span className="text-secondary mr-2 flex-grow truncate">
              {post.title}
            </span>
            <span className="text-tertiary flex-shrink-0">
              <DateViewer date={post.publishedAt} />{' '}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
