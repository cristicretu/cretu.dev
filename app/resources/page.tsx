import { resources } from '@/data/resources';
import { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'A place where I share ideas about design and code.',
  title: 'Writing',
};

export default async function Resources() {
  return (
    <div className="space-y-16">
      <h1>Resources</h1>
      <p className="text-secondary">
        A curated collection of captivating articles, thought-provoking essays,
        and enlightening videos to broaden and elevate your intellectual
        horizons.
      </p>
      <div className="flex flex-col space-y-2">
        {resources.map((resource) => (
          <Item
            description={resource.description}
            key={resource.title}
            link={resource.link}
            title={resource.title}
          />
        ))}
      </div>
    </div>
  );
}

function Item({
  title,
  description,
  link,
}: {
  description: string;
  link: string;
  title: string;
}) {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${link}&sz=${64}`;

  return (
    <a
      className="-mx-2 flex cursor-ne-resize flex-row justify-between rounded-md px-2 py-2 transition-all duration-200 hover:bg-gray-500/10"
      href={link}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="h-8 w-8 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${title} favicon`}
          className="h-full w-full rounded-md bg-gray-500/20 object-contain px-0.5 py-0.5"
          src={faviconUrl}
        />
      </div>{' '}
      <div className="ml-2 flex flex-grow flex-col">
        <span className="text-secondary mr-2 flex-grow truncate">
          {title} ¬
        </span>
        <span className="text-tertiary flex-shrink">{description}</span>
      </div>
    </a>
  );
}
