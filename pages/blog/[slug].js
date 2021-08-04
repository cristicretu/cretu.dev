import { MDXRemote } from "next-mdx-remote";
import { getFiles, getFileBySlug } from "../../lib/mdx";
import BlogComponent from "../../components/BlogComponent";

export default function Blog({ mdxSource, frontMatter }) {
    return (
        <BlogComponent frontMatter={frontMatter}>
            <MDXRemote {...mdxSource} />
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

// export async function getStaticProps(context) {
//     const { params } = context;
//     const allPosts = getAllPosts();
//     const { data, content } = allPosts.find(
//         (item) => item.slug === params.slug
//     );
//     const mdxSource = await content;

//     return {
//         props: {
//             ...data,
//             // date: data.date,
//             content: mdxSource,
//         },
//     };
// }

// export async function getStaticPaths() {
//     return {
//         paths: getFiles().map((post) => ({
//             params: {
//                 slug: post.slug,
//             },
//         })),
//         fallback: false,
//     };
// }
