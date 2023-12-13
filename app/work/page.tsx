/* eslint-disable @next/next/no-img-element */
import WorkLayout from './layout';
import { works } from '@/data/work';
import { cn } from '@/lib/className';
import { ReactElement } from 'react';

export default function Work() {
  return (
    <div className="columns-1 gap-2 sm:columns-2 md:columns-3  [&>div:not(:first-child)]:mt-2">
      {works.map((work) => (
        <Card
          authors={work.authors}
          company={work.company}
          description={work.description}
          h={work.h}
          img={work.img}
          key={work.title}
          title={work.title}
        />
      ))}
    </div>
  );
}

function Card({
  description = '2021',
  title = 'Deta',
  img,
  authors,
  h = 'h-48',
  company,
}: {
  authors?: string[];
  company?: string;
  description?: string;
  h?: string;
  img?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        'group relative flex break-inside-avoid flex-col space-y-4 rounded-lg bg-gray-100 px-2 py-2.5 text-gray-200 dark:bg-gray-800',
      )}
    >
      <div className={cn('relative rounded-lg', h, 'overflow-hidden')}>
        <img
          alt={title}
          className="absolute h-full w-full rounded-lg object-cover transition-all duration-200 group-hover:blur-xl"
          src={img}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-800 opacity-60 transition-opacity duration-200 group-hover:opacity-90"></div>
      </div>

      <div className="absolute flex w-full flex-row justify-between pl-4 pr-8 transition-all duration-200  group-hover:opacity-0">
        <span>{title}</span>
        <span className="font-mono">{description}</span>
      </div>

      <div className="absolute inset-0 z-20 flex select-none flex-col items-center justify-center space-y-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex select-none flex-col">
          <span className=" font-bold">{title}</span>
          <span>{description}</span>
          {company && <span>{company}</span>}

          <div className="mt-4 select-none">
            {authors?.map((author) => (
              <span className="block" key={author}>
                {author}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Work.getLayout = function getLayout(page: ReactElement) {
  return <WorkLayout>{page}</WorkLayout>;
};
