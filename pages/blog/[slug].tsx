import { MDXRemote } from "next-mdx-remote";
import BlogComponent from "../../components/BlogComponent";
import MDXComponents from "../../components/MDXComponents";
import { getFileBySlug, getFiles } from "../../lib/mdx";

export default function Blog({ mdxSource, frontMatter }) {
  return (
    <BlogComponent frontMatter={frontMatter}>
      <MDXRemote
        {...mdxSource}
        components={{
          ...MDXComponents,
        }}
      />
    </BlogComponent>
  );
}

export async function getStaticPaths() {
  const posts = await getFiles("blog");

  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, ""),
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getFileBySlug("blog", params.slug);
  return { props: { ...post } };
}
