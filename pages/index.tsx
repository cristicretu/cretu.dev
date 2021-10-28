import { useEffect, useState } from "react";

import Container from "../components/Container";
import Image from "next/image";
import Link from "next/link";
import { RoughNotation } from "react-rough-notation";

export default function Home() {
  return (
    <Container>
      <div className="my-2 sm:my-4 md:my-8 flex px-2 sm:px-2 md:px-0 flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16">
        <Introduction />
      </div>
    </Container>
  );
}

function Introduction() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
  }, [])

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4 items-center  mb-2">
        <Image
          className="rounded-full "
          src="/static/images/avatar.png"
          height={64}
          placeholder="blur"
          blurDataURL="/static/images/avatar.png"
          width={64}
          layout="fixed"
          alt="avatar"
        />
        <div className="flex flex-col">
          <h1 className="font-semibold text-2xl tracking-tight dark:text-white">
            Cristian Crețu
          </h1>
          <RoughNotation type="underline" show={show}>
            <p className="text-md tracking-tight text-black dark:text-white">
              Developer and designer
            </p>
          </RoughNotation>
        </div>
      </div>
      <div className="flex flex-col space-y-4">
        <p className=" text-gray-600 dark:text-gray-400">
          Cristian is a developer, designer, and aspiring software engineer
          –&nbsp;{" "}
          <a
            href="https://www.fiverr.com/cristicretu/make-a-beautiful-landing-page-using-react-html-tailwindcss"
            target="_blank"
            rel="noreferrer"
            className="custom-underline text-black dark:text-white"
          >
            he is available for hire
          </a>
          .
        </p>
        <p className=" text-gray-600 dark:text-gray-400">
          He enjoys digital art and graphic design. Cristian uses tools like
          Figma, Photoshop, Affinity Photo, and Affinity Designer for creating
          digital art.
        </p>


        <p className=" text-gray-600 dark:text-gray-400">
          This is Cristian&apos;s digital garden of the internet, where he
          writes about tech, programming, and other stuff that he&apos;s working
          on.
        </p>
        <RoughNotation type="highlight" show={show}>
          <p className=" dark:text-gray-600 text-gray-400">
            For more details, please check out the{" "}
            <Link href="/about">
              <a className="custom-underline dark:text-black text-white">
                about me
              </a>
            </Link>{" "}
            page.
          </p>
        </RoughNotation>
      </div>
    </div>
  );
}
