import { pick } from "contentlayer/client";
import { allWritings } from ".contentlayer/generated";
import type { Writing } from "contentlayer/generated";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/className";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "A place where I share ideas about design and code.",
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
    <div className="space-y-12">
      <h1>Writing</h1>
      <div className="space-y-2">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className={cn(
              "flex flex-row justify-between py-2 px-2 -mx-2 rounded-md",
              "hover:bg-gray-200 dark:hover:bg-gray-800",
              "transition-all duration-200"
            )}
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
