import { useRouter } from "next/dist/client/router";
import Achievements from "../components/Achievements";
import Container from "../components/Container";

function about() {
  const router = useRouter();
  return (
    <Container>
      <div className="my-2 sm:my-4 md:my-8 flex space-y-12 px-2 sm:px-2 md:px-0 flex-col justify-center text-black dark:text-white items-start max-w-2xl mx-auto ">
        <div className="flex flex-col space-y-4">
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
            About me
          </h1>
          <p className=" text-gray-600 dark:text-gray-400">
            Hey! I'm Cristi, a young developer eager to learn more about tech
            and programming. I'm currently a student working on many side
            projects and freelancing.
          </p>
          <p className=" text-gray-600 dark:text-gray-400">
            Recently I started writing about front-end, development, competitive
            programming, and productivity here and on{" "}
            <a
              className="custom-underline text-black dark:text-white"
              href="https://twitter.com/cristicrtu"
              target="_blank"
            >
              Twitter
            </a>
            .
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            I grew up in a small town in Romania 🇷🇴 and I currently am in
            High-School. In my free time, I like to create graphic design,
            listen to music, cycle, and play football.
          </p>
        </div>
        <Achievements />
      </div>
    </Container>
  );
}

export default about;
