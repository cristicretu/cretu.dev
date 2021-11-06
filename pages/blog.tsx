import BlogPost from '../components/BlogPost';
import Container from '../components/Container';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { getAllFilesFrontMatter } from '../lib/mdx';
import { useState } from 'react';

const Blog = ({ posts }) => {
  const [Results, setResults] = useState('');
  const SearchResults = posts
    .sort(
      (a, b) =>
        Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt))
    )
    .filter((date) => date.title.toLowerCase().includes(Results.toLowerCase()));

  return (
    <Container
      title="Cristian Crețu - Blog"
      description="A place where I share my thoughts about programming and tech."
    >
      <div className="my-2 sm:my-4 md:my-8 flex px-2 sm:px-2 md:px-0 flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16">
        <div className="flex flex-col space-y-8 max-w-2xl">
          <div>
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
              Blog
            </h1>
            <p className=" text-gray-600 dark:text-gray-400">
              This is Cristian&apos;s digital garden of the internet, where he
              writes about tech, programming, and other stuff that he&apos;s working
              on. Use the ssearch box bellow to filter blog posts 👇
            </p>
          </div>
          <div className=" relative w-full space-x-2 flex px-4 py-2 items-center font-bold text-lg rounded-md text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800">
            <MagnifyingGlassIcon className='h-5 w-5 fill-current' />
            <input
              value={Results}
              className="flex-grow rounded-xs block w-full bg-transparent outline-none"
              aria-label="Search articles"
              type="text"
              onChange={(e) => setResults(e.target.value)}
              placeholder="Search Articles"
            />
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          {!SearchResults.length && (
            <p className="text-gray-700 dark:text-gray-300">
              No results found.
            </p>
          )}
          {SearchResults.map((data) => (
            <BlogPost key={data.title} {...data} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Blog;

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog');
  return { props: { posts } };
}
