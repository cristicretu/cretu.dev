import { Writing, allWritings } from "@/.contentlayer/generated";
import { Mdx } from "@/ui/MDXComponents";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../../styles/prose.css";
import { format, parseISO } from "date-fns";
import Image from "next/image";

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

export default async function WritingPost({ params }: { params: any }) {
  const post = allWritings.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="text-secondary">
      <h1 className="text-primary">{post.title}</h1>
      <div className="flex flex-row divide-x-2 divide-gray-500 gap-4 items-center">
        <span> Cristian Crețu</span>
        <span className="pl-2">
          {format(parseISO(post.publishedAt), "MMMM dd, yyyy")}
        </span>
        <span className="pl-2">{post.readingTime.text}</span>
      </div>
      <div className="relative h-64">
        <Image
          src={post.image}
          alt={post.title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <Mdx code={post.body.code} />
    </div>
  );
}
