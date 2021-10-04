import { useState } from "react";
import BlogPost from "../components/BlogPost";
import Container from "../components/Container";
import { getAllFilesFrontMatter } from "../lib/mdx";

function blog({ posts }) {
  const [Results, setResults] = useState("");
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
              This is the start to my blog! A lot more posts are coming. Use the
              search box bellow to filter blog posts 👇
            </p>
          </div>
          <div className=" relative w-full space-x-2 flex px-4 py-2 items-center font-bold text-lg rounded-md text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>{" "}
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
}

export default blog;

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter("blog");
  return { props: { posts } };
}
