import '../../../styles/prose.css';
import { Writing, allWritings } from '@/.contentlayer/generated';
import ExternalLink from '@/ui/ExternalLink';
import { Mdx } from '@/ui/MDXComponents';
import { format, parseISO } from 'date-fns';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return allWritings.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Writing;
}): Promise<Metadata | undefined> {
  const post = allWritings.find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
    slug,
  } = post;
  const ogImage = image
    ? `https://cretu.dev${image}`
    : `https://cretu.dev/api/og?title=${title}`;

  return {
    description,
    openGraph: {
      description,
      images: [
        {
          url: ogImage,
        },
      ],
      publishedTime,
      title,
      type: 'article',
      url: `https://cretu.dev/blog/${slug}`,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [ogImage],
      title,
    },
  };
}

const editUrl = (slug: string) =>
  `https://github.com/cristicretu/cretu.dev/edit/main/data/writing/${slug}.mdx`;

export default async function WritingPost({ params }: { params: any }) {
  const post = allWritings.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="text-secondary">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(post.structuredData),
        }}
        suppressHydrationWarning
        type="application/ld+json"
      ></script>
      <Link className="text-secondary text-sm no-underline" href="/writing">
        ← Back to all posts
      </Link>
      <h1 className="text-primary text-2xl font-medium">{post.title}</h1>
      <div className="-mt-3 grid w-fit grid-cols-1 gap-2 divide-gray-500 text-sm sm:grid-cols-2">
        <span>{format(parseISO(post.publishedAt), 'MMMM dd, yyyy')}</span>
        <span>{post.readingTime.text}</span>
      </div>
      <div className="relative mt-8 h-[400px]">
        <Image
          alt={post.title}
          className="rounded-lg"
          layout="fill"
          objectFit="cover"
          src={post.image}
        />
      </div>
      <Mdx code={post.body.code} />
      <div className='mt-4'>
        You can follow me on <ExternalLink href="https://twitter.com/cristicrtu">Twitter</ExternalLink>, where I document my journey :)
        <ExternalLink className="text-sm" href={editUrl(post.slug)}>
          Edit source on GitHub
        </ExternalLink>
      </div>
    </div>
  );
}
