import React, { useMemo } from 'react'

import { getMDXComponent } from 'mdx-bundler/client'

import BlogComponent from '@components/BlogComponent'
import components from '@components/MDXComponents'
import { getFileBySlug, getFiles } from 'lib/mdx'

export default function Blog({ code, frontMatter }) {
  const Component = useMemo(() => getMDXComponent(code), [code])

  return (
    <BlogComponent frontMatter={frontMatter}>
      <Component
        components={
          {
            ...components,
          } as any
        }
      />
    </BlogComponent>
  )
}

export async function getStaticPaths() {
  const posts = await getFiles('blog')

  return {
    paths: posts.map(p => ({
      params: {
        slug: p.replace(/\.mdx/, ''),
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = await getFileBySlug('blog', params.slug)

  return { props: { ...post } }
}
