import React, { useEffect } from 'react';

import BlogPost from 'components/BlogPost';
import Container from 'components/Container';
import { ProjectCard } from 'components/ProjectCard';
import TwitterAt from 'components/TwitterAt';
import useDelayedRender from 'use-delayed-render';

interface homeProps {}

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Home: React.FC<homeProps> = ({}) => {
  const { rendered } = useDelayedRender(true, {
    exitDelay: 2000
  });

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    setShow(true);
  });

  // useEffect(() => {
  //   const clickedCmdk = (e) => {
  //     let charCode = String.fromCharCode(e.which).toLowerCase()
  //     if (e.metaKey && charCode === 'k') {
  //       e.preventDefault()
  //       console.log("cmd+k works")
  //     }
  //   }
  //   window.addEventListener("keydown", clickedCmdk)
  //   return () => {
  //     window.removeEventListener("keydown", clickedCmdk)
  //   }
  // })

  return (
    <Container>
      <div className="w-full">
        <div className="flex flex-col space-y-4 text-gray-600 dark:text-gray-400">
          <div className="flex space-x-4 items-center mb-2 delayed">
            <div
              className={cx('flex flex-col before', rendered ? 'after' : '')}
              style={{ transitionDelay: '250ms' }}
            >
              <h1 className="font-bold text-2xl tracking-tight dark:text-white text-black">
                Cristian Crețu
              </h1>
              <p className="text-md">Developer and designer</p>
            </div>
          </div>

          <div
            className={cx(
              'flex flex-col space-y-2 before',
              rendered ? 'after' : ''
            )}
            style={{ transitionDelay: '325ms' }}
          >
            <p>
              <span className="font-serif italic text-lg">
                Making the web feel &apos;right&apos; and faster.
              </span>{' '}
              Creating full-stack applications - focusing on performance and
              usability. Thinkering with digital art and creating visual
              interfaces. Full-time student and side-project hustler.
            </p>
          </div>

          <div
            className={cx(
              'flex flex-col space-y-2 before',
              rendered ? 'after' : ''
            )}
            style={{ transitionDelay: '375ms' }}
          >
            <p>
              Learning about performant, accessible, and beautiful web
              components and apps. <br />
              Interested in C, TypeScript, and Python. Curious about Rust and
              Swift. Building web applications using ReactJs, NextJs for
              interfaces, and Node.js with GraphQL for the back-end.
            </p>
          </div>

          <div
            className={cx(
              'flex flex-col space-y-2 before',
              rendered ? 'after' : ''
            )}
            style={{ transitionDelay: '400ms' }}
          >
            <p>
              Enjoying sports, design, and music. I listen to a lot of lo-fi and
              electronic songs.
            </p>
          </div>

          <div
            className={cx(
              'grid grid-cols-1 md:grid-cols-2 before',
              rendered ? 'after' : ''
            )}
            style={{ transitionDelay: '435ms' }}
          >
            <div className="flex flex-col space-y-4 mt-4 md:mt-8">
              <p>Projects</p>
              <ProjectCard
                title="Inspo."
                description="Get inspiration for your React Components."
                type="small"
                github="https://github.com/cristicretu/inspo"
                url="https://inspo.cretu.dev"
              />
              <ProjectCard
                title="Covid Tracker"
                description="Realtime Covid-19 Tracker for Romania."
                type="small"
                github="https://github.com/cristicretu/rocovidtracker"
                url="https://covid.cretu.dev"
              />
              <ProjectCard
                title="Ultimate Front-End Template"
                description="Reusable front-end template, using my prefereed stack: NextJs, TailwindCSS, Typescript, Dark Mode, Custom Font, Components and more."
                type="small"
                github="https://github.com/cristicretu/ts-next-tailwind-template"
                url="https://template.cretu.dev"
              />
            </div>

            <div className="flex flex-col space-y-4 mt-4 md:mt-8">
              <p>Writing</p>
              <BlogPost
                summary="My thoughts on 2021"
                title="2021 in Review"
                slug="2021"
                type="small"
              />
              <BlogPost
                summary="A roadmap for everyone to learn more about the web."
                title="Learning Web Development"
                slug="learning-web-dev"
                type="small"
              />
              <BlogPost
                summary="Short tutorial explaining how to create good-looking gradients."
                title="Making Gradients"
                slug="gradient-wallpapers"
                type="small"
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Home;
