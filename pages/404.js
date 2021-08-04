import Link from "next/link";
import Container from "../components/Container";

export default function NotFound() {
    return (
        <Container title="404 - Cristian Crețu">
            <div className="my-2 sm:my-4 md:my-8 flex flex-col justify-center items-start max-w-2xl mx-auto mb-16">
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                    404 - Not Found
                </h1>
                <div className="flex flex-col space-y-12">
                    <p className=" text-gray-600 dark:text-gray-400">
                        Oops! Seems that you've entered
                        <a className="italic"> the dark side</a>. You found
                        something that used to exist, or you typed something
                        wrong. Try that URL again, or 👇
                    </p>
                    <Link href="/">
                        <a className="mx-auto px-12 py-4 font-bold text-lg rounded-md text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-900">
                            Return home
                        </a>
                    </Link>
                </div>
            </div>
        </Container>
    );
}
