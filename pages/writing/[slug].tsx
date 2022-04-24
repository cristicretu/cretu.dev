import { useMDXComponent } from 'next-contentlayer/hooks'

import BlogComponent from '@components/BlogComponent'
import components from '@components/MDXComponents'
import { IMeta } from '@lib/types'
import { allWritings } from 'contentlayer/generated'

export default function Blog({ props }) {
  const Component = useMDXComponent(props.body.code)

  const frontMatter = {
    title: props.title,
    publishedAt: props.publishedAt,
    slug: props.slug,
    image: props.image,
    summary: props.summary,
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
  const paths: string[] = allWritings.map(writing => writing._raw.flattenedPath)
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = allWritings.find(
    writing => writing._raw.flattenedPath === params.slug
  )

  return {
    props: { post },
  }
}
