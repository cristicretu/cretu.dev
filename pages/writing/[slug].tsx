import { useMDXComponent } from 'next-contentlayer/hooks'
import readingTime from 'reading-time'

import BlogComponent from '@components/BlogComponent'
import components from '@components/MDXComponents'
import { IMeta } from '@lib/types'
import { allWritings } from 'contentlayer/generated'
import type { Writing } from 'contentlayer/generated'

export default function Blog({ post }: { post: Writing }): JSX.Element {
  const Component = useMDXComponent(post.body.code)

  const frontMatter = {
    title: post.title,
    publishedAt: post.publishedAt,
    slug: post.slug,
    image: post.image,
    summary: post.summary,
    readingTime: readingTime(post.body.raw),
  }

  return (
    <BlogComponent frontMatter={frontMatter as IMeta}>
      <Component
        components={
          {
            ...components,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      />
    </BlogComponent>
  )
}

export async function getStaticPaths() {
  const paths: string[] = allWritings.map(
    writing => `/${writing._raw.flattenedPath}`
  )
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = allWritings.find(writing => writing.slug === params.slug)
  return { props: { post } }
}
