import Head from "next/head";
import Container from "../components/Container";
import Link from "next/link";
import Projects from "../components/Projects";
import Achivements from "../components/Achievements";

export default function Home() {
    return (
        <Container>
            <div className="my-2 sm:my-4 md:my-8 flex px-2 sm:px-2 md:px-0 flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16">
                <Introduction />
                <Projects />
                <Achivements />
            </div>
        </Container>
    );
}

function Introduction() {
    return (
        <div className="flex flex-col">
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                Hi 👋 , I'm Cristian Crețu
            </h1>
            <div className="flex flex-col space-y-4">
                <p className=" text-gray-600 dark:text-gray-400">
                    I'm a developer, designer and an aspiring software engineer.
                    I work as a freelancer –&nbsp;{" "}
                    <a
                        href="https://www.fiverr.com/cristicretu/make-a-beautiful-landing-page-using-react-html-tailwindcss"
                        target="_blank"
                        className="underline text-blue-500"
                    >
                        I'm available for hire
                    </a>
                    .
                </p>
                <p className=" text-gray-600 dark:text-gray-400">
                    I also enjoy digital art and graphic-design. I'm making and
                    constantly learning UI/UX design using Figma. For more
                    complex designs, I use Photoshop, Affinity Photo and
                    Affinity Designer.
                </p>

                <p className=" text-gray-600 dark:text-gray-400">
                    This is my digital garden of the internet, where I write
                    about tech, programming and other stuff that I'm working on.
                </p>
                <p className=" text-gray-600 dark:text-gray-400">
                    For more details, check out the{" "}
                    <Link href="/about">
                        <a className="underline text-blue-500">about me</a>
                    </Link>{" "}
                    page.
                </p>
            </div>
        </div>
    );
}
