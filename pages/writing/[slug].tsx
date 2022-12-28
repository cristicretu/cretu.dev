import type { GetStaticPaths, GetStaticProps } from 'next'
import { useMDXComponent } from 'next-contentlayer/hooks'

import components from '@components/MDXComponents'
import WritingLayout from '@components/WritingLayout'
import { allWritings, Writing } from 'contentlayer/generated'

const Post = ({ post }: { post: Writing }) => {
  const Component = useMDXComponent(post.body.code)

  return (
    <WritingLayout post={post}>
      <Component
        components={
          {
            ...components,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      />
    </WritingLayout>
  )
}

export default Post

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: string[] = allWritings.map(
    writing => `/${writing._raw.flattenedPath}`
  )

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post: Writing | undefined = allWritings.find(
    writing => writing.slug === params?.slug
  )

  return {
    props: {
      post,
    },
  }
}
