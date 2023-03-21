import { Writing, allWritings } from "@/.contentlayer/generated";
import { Mdx } from "@/ui/MDXComponents";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../../styles/prose.css";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import ExternalLink from "@/ui/ExternalLink";
import Link from "next/link";

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
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `https://cretu.dev/blog/${slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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
      <Link href="/writing" className="no-underline text-sm text-secondary">
        ← Back to all posts
      </Link>
      <h1 className="text-primary text-2xl font-medium">{post.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 divide-gray-500 w-fit text-sm -mt-3">
        <span>{format(parseISO(post.publishedAt), "MMMM dd, yyyy")}</span>
        <span>{post.readingTime.text}</span>
      </div>
      <div className="relative h-[400px] mt-8">
        <Image
          src={post.image}
          alt={post.title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <Mdx code={post.body.code} />
      <ExternalLink href={editUrl(post.slug)} className="text-sm">
        Edit source on GitHub
      </ExternalLink>
    </div>
  );
}
