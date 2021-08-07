import Container from "./Container";
import Image from "next/image";
import { parseISO, format } from "date-fns";

export default function BlogComponent({ children, frontMatter }) {
    return (
        <Container
            title={`${frontMatter.title} – Cristian Crețu`}
            description={frontMatter.summary}
            image={`https://cretu.dev${frontMatter.image}`}
            date={new Date(frontMatter.publishedAt).toISOString()}
            type="article"
        >
            <article className="my-2 sm:my-4 md:my-8 flex px-8 sm:px-2 md:px-0 flex-col justify-center space-y-2 md:space-y-4 items-start max-w-2xl mx-auto mb-16">
                <div className="flex flex-col space-y-4 ">
                    <h1 className="font-bold text-3xl md:text-5xl tracking-tight text-black dark:text-white">
                        {frontMatter.title}
                    </h1>{" "}
                    <div className="flex justify-between">
                        <p className=" text-black dark:text-white">
                            Cristian Crețu -{" "}
                            {format(
                                parseISO(frontMatter.publishedAt),
                                "MMMM dd, yyyy"
                            )}
                        </p>
                        <p className="text-black dark:text-white">
                            {frontMatter.readingTime.text}
                        </p>
                    </div>
                    <Image
                        alt="blog-image/"
                        layout="responsive"
                        src={frontMatter.image}
                        width={508}
                        height={346}
                        className="rounded-md"
                    />
                    <p className=" text-gray-600 dark:text-gray-400">
                        {frontMatter.summary}
                    </p>
                </div>
                <div className="prose dark:prose-dark max-w-none w-full">
                    {children}
                </div>
            </article>
        </Container>
    );
}
