import Container from "./Container";
import { parseISO, format } from "date-fns";

export default function BlogComponent({ children, frontMatter }) {
    return (
        <Container
            title={`${frontMatter.title} – Cristian Crețu`}
            description={frontMatter.summary}
            // // image={`https://leerob.io${frontMatter.image}`}
            date={new Date(frontMatter.publishedAt).toISOString()}
            type="article"
        >
            <article className="my-2 sm:my-4 md:my-8 flex px-8 sm:px-2 md:px-0 flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16">
                <div>
                    <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                        {frontMatter.title}
                    </h1>{" "}
                    <h3>
                        Cristian Crețu -{" "}
                        {format(
                            parseISO(frontMatter.publishedAt),
                            "MMMM dd, yyyy"
                        )}
                    </h3>
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
