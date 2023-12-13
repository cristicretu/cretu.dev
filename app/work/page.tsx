import WorkLayout from './layout';
import { cn } from '@/lib/className';
import { ReactElement } from 'react';

export default function Work() {
  return (
    <div className="columns-1 gap-2 sm:columns-2 md:columns-3  [&>div:not(:first-child)]:mt-2">
      <Card
        authors="Cristi, Alex"
        img="/images/deta.png"
        order={1}
        title="Deta"
        year="2021"
      />
      <Card
        authors="David, Alex"
        img="/images/deta.png"
        order={2}
        title="Something else"
        year="2023"
      />

      <Card
        authors="Cristi, Alex"
        img="/images/deta.png"
        order={3}
        title="Seggg"
        year="2025"
      />

      <Card
        authors="Cristi, Alex"
        img="/images/deta.png"
        order={4}
        title="Deta"
        year="2021"
      />
      <Card
        authors="David, Alex"
        img="/images/deta.png"
        order={5}
        title="Something else"
        year="2023"
      />

      <Card
        authors="Cristi, Alex"
        img="/images/deta.png"
        order={6}
        title="Seggg"
        year="2025"
      />
    </div>
  );
}

function Card({
  year = '2021',
  title = 'Deta',
  img = '/images/deta.png',
  authors = 'Cristi, Alex',
  order = 0,
}: {
  authors?: string;
  img?: string;
  order?: number;
  title?: string;
  year?: string;
}) {
  const heigts = ['h-64', 'h-72', 'h-80', 'h-96'];
  return (
    <div
      className={cn(
        'relative flex break-inside-avoid flex-col space-y-4 rounded-lg bg-gray-100 px-2 py-2.5 dark:bg-gray-800',
        `!order-${order}`,
      )}
    >
      <div
        className={
          (cn('relative h-64 w-full rounded-lg'),
          heigts[Number.parseInt(year) % 4])
        }
      >
        <div className="h-full w-full rounded-md bg-red-500" />
      </div>

      <div className="absolute flex w-full flex-row justify-between pl-4 pr-12">
        <span>{title}</span>
        <span>{year}</span>
      </div>
    </div>
  );
}

Work.getLayout = function getLayout(page: ReactElement) {
  return <WorkLayout>{page}</WorkLayout>;
};
