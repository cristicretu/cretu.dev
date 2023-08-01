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
        <p className="text-quaternary">Design Engineer in Europe</p>
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
          Exploring ways to create unique, fluid experiences. Unlimitedly
          obsessed with solving problems where design and engineering intersect,
          by creating pixel-perfect, polished interfaces.
        </p>
        <p>
          Currently tinkering with various projects and apps. Streamlining a new
          platform, for the next era of{' '}
          <ExternalLink href="https://deta.space/docs/en/learn/what-is-pc#content">
            personal computing
          </ExternalLink>{' '}
          at <ExternalLink href="https://deta.space">Deta</ExternalLink>.
          Previously worked at{' '}
          <ExternalLink href="https://landmarks.ro">Landmarks</ExternalLink> -
          building beautiful web apps.
        </p>
        <p>
          Studying Computer Science. Ardent in reading, writing, and improving
          consistently through learning. Currently interested in TypeScript and
          C. Experimenting native apps with Swift. Generating new experiences
          with Figma.
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
      <p className="text-tertiary">Connect</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ContactLink
          href="https://twitter.com/cristicrtu"
          title="cristicrtu"
          website="Twitter"
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
