import { pick } from "contentlayer/client";
import { allWritings } from ".contentlayer/generated";
import type { Writing } from "contentlayer/generated";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/className";
import { Metadata } from "next";

export const metadata: Metadata = {
  description: "A place where I share ideas about design and code.",
  title: "Writing",
};

async function getData() {
  const posts = allWritings
    .map((post) => pick(post, ["slug", "title", "summary", "publishedAt"]))
    .sort(
      (a, b) =>
        Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt))
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
    <div className="space-y-16">
      <h1>Writing</h1>
      <p className="text-tertiary">If you&apos;re interested in exploring the articles that inspire me and shape my thinking, check out <Link className="underline " href={"/resources"}>Resources ¬</Link>.</p>
      <div className="space-y-2">
        {posts.map((post) => (
          <Link
            className={cn(
              "flex flex-row justify-between py-2 px-2 -mx-2 rounded-md",
              "hover:bg-gray-200 dark:hover:bg-gray-800",
              "transition-all duration-200"
            )}
            href={`/writing/${post.slug}`}
            key={post.slug}
          >
            <span className="flex-grow truncate text-secondary mr-2">
              {post.title} →
            </span>
            <span className="text-tertiary flex-shrink-0">
              {format(parseISO(post.publishedAt), "MMMM yyyy")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
