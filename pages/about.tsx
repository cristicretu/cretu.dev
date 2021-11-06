import { useEffect, useState } from 'react';

import Achievements from '../components/Achievements';
import Container from '../components/Container';
import { RoughNotation } from 'react-rough-notation';

function About() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);
  return (
    <Container>
      <div className="my-2 sm:my-4 md:my-8 flex space-y-4 px-2 sm:px-2 md:px-0 flex-col justify-center text-black dark:text-white items-start max-w-2xl mx-auto ">
        <div className="flex flex-col space-y-2">
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
            About me
          </h1>
          <p className=" text-gray-600 dark:text-gray-400">
            Hello, I&lsquo;m{' '}
            <RoughNotation type="circle" show={show}>
              Cristian
            </RoughNotation>
            , a young developer eager to learn more about tech and programming.
            I&lsquo;m currently a student working on many side projects and
            freelancing.
          </p>
          <p className=" text-gray-600 dark:text-gray-400">
            Recently I started writing about full-stack development, competitive
            programming, and productivity here and on{' '}
            <a
              className="custom-underline text-black dark:text-white"
              href="https://twitter.com/cristicrtu"
              rel="noreferrer"
              target="_blank"
            >
              Twitter
            </a>
            .
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            In my free time, I like to create digital art, listen to music,
            cycle, and play football.
          </p>
        </div>
        <Achievements />
      </div>
    </Container>
  );
}

export default About;
