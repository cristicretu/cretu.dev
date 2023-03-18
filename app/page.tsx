import Image from "next/image";

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
      <div className="w-12 h-12 relative">
        <Image
          src="/static/images/logo.png"
          layout="fill"
          objectFit="contain"
          alt="Logo"
          className="rounded-full"
        />
        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 rounded-full px-1 py-0.5 text-sm">
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
      <div className="flex flex-col gap-4 text-secondary">
        <p>
          Exploring ways to create unique, fluid experiences. Unlimitedly
          obsessed with solving problems where design and engineering intersect,
          by creating pixel-perfect, polished interfaces.
        </p>
        <p>
          Currently tinkering with various projects and apps. Previously worked
          at Deta, streamlining a new platform, for the future cloud computer ↗
          and Landmarks - building beautiful web apps.
        </p>
        <p>
          Studying Computer Science. Ardent in reading, writing, and improving
          consistently through learning. Currently interested in TypeScript and
          C. Experimenting native apps with Swift. Generating new experiences
          with Figma.{" "}
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
  href?: string;
  title: string;
  website: string;
  email?: string;
}) {
  return (
    <div className="flex flex-row items-center gap-4">
      <p className="text-quaternary">{website}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:text-primary transition-opacity duration-150"
        >
          {title} ↗
        </a>
      )}
      {email && (
        <p className="text-secondary hover:text-primary transition-opacity duration-150">
          {title}
        </p>
      )}
    </div>
  );
}

function Contact() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-tertiary">Contact</p>
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
      </div>
    </div>
  );
}
