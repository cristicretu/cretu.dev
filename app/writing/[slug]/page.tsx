import '../../../styles/prose.css';
import { Writing, allWritings } from '@/.contentlayer/generated';
import DateViewer from '@/ui/DateView';
import ExternalLink from '@/ui/ExternalLink';
import { Mdx } from '@/ui/MDXComponents';
import { Metadata } from 'next';
import Image from 'next/image';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function WritingPost({ params }: { params: any }) {
  const post = allWritings.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="text-secondary mx-auto max-w-2xl">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(post.structuredData),
        }}
        suppressHydrationWarning
        type="application/ld+json"
      ></script>
      <p className="text-tertiary mb-2 font-mono text-sm bg-gray-200 dark:bg-gray-800 w-fit px-1.5 py-0.5 rounded-md -ml-1">
        <DateViewer date={post.publishedAt} />
      </p>
      <h1 className="text-primary text-3xl font-semibold">{post.title}</h1>
      {post.image && (
        <div className="relative mt-8 h-[400px]">
          <Image
            alt={post.title}
            className="rounded-lg"
            layout="fill"
            objectFit="cover"
            src={post.image}
          />
        </div>
      )}
      <Mdx code={post.body.code} />
      <div className="mt-8">
        <ExternalLink className="text-sm" href={editUrl(post.slug)}>
          Edit source on GitHub
        </ExternalLink>
      </div>
    </div>
  );
}
