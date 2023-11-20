import ExternalLink from '@/ui/ExternalLink';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <Header />
      <Contact />
      <AboutMe />
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-row items-center gap-4">
      <div className="relative h-12 w-12">
        <Image
          alt="Logo"
          className="rounded-full"
          layout="fill"
          objectFit="contain"
          src="/static/images/logo.png"
        />
        <div className="absolute -bottom-2 -right-2 rounded-full bg-white px-1 py-0.5 text-sm dark:bg-gray-900">
          ✨
        </div>
      </div>
      <div className="flex flex-col">
        <h1>Cristian Crețu</h1>
        <p className="text-quaternary">Design Engineer</p>
      </div>
    </div>
  );
}

function AboutMe() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-tertiary">About me</p>
      <div className="text-secondary flex flex-col gap-4">
        <p>
          Passionate about crafting seamless, polished interfaces where design
          meets engineering.
        </p>
        <p>
          Working on multiple projects and apps; formerly at{' '}
          <ExternalLink arrow={false} href="https://deta.space">
            Deta
          </ExternalLink>{' '}
          developing the{' '}
          <ExternalLink href="https://deta.space/docs/en/learn/what-is-pc#content">
            OS for the web
          </ExternalLink>{' '}
          , and at{' '}
          <ExternalLink arrow={false} href="https://github.com/Landmarks-Tech">
            Landmarks
          </ExternalLink>{' '}
          creating stunning web applications.
        </p>
        <p>
          Currently studying Computer Science at BBU. Ardent in reading,
          writing, and improving consistently through learning.
        </p>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  title,
  website,
  email,
}: {
  email?: string;
  href?: string;
  title: string;
  website?: string;
}) {
  return (
    <span className="block items-center gap-4">
      {website && <p className="text-quaternary">{website}</p>}
      {href && (
        <a
          className="text-secondary hover:text-primary transition-opacity duration-150"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {title}{' '}
          <svg
            className=" inline-block h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      )}
      {email && (
        <p className="text-secondary hover:text-primary transition-opacity duration-150">
          {title}
        </p>
      )}
    </span>
  );
}

function Contact() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-tertiary">Links</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ContactLink
          href="https://X.com/cristicrtu"
          title="cristicrtu"
          website="X"
        />
        <ContactLink
          href="https://github.com/cristicretu"
          title="cristicretu"
          website="GitHub"
        />
        <ContactLink
          href="https://www.figma.com/@cretu"
          title="cretu"
          website="Figma"
        />
        <ContactLink
          href="https://layers.to/cretu"
          title="cretu"
          website="Layers.to"
        />
        <ContactLink
          email="hi[at]cretu(dot)dev"
          title="hi[at]cretu(dot)dev"
          website="Email"
        />
        <ContactLink href="https://read.cv/cretu" title="cretu" website="CV" />
      </div>
    </div>
  );
}
