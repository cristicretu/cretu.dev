import { getFileBySlug, getFiles } from 'lib/mdx';

import BlogComponent from '@components/BlogComponent';
import { MDXRemote } from 'next-mdx-remote';
import components from '@components/MDXComponents';
import { getMDXComponent } from 'mdx-bundler/client';
import { useMemo } from 'react';

export default function Blog({ code, frontMatter }) {
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <BlogComponent frontMatter={frontMatter}>
      <Component
        components={
          {
            ...components
          } as any
        }
      />
    </BlogComponent>
  );
}

export async function getStaticPaths() {
  const posts = await getFiles('blog');

  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, '')
      }
    })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const post = await getFileBySlug('blog', params.slug);

  return { props: { ...post } };
}
