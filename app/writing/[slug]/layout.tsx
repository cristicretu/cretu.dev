import { Suspense } from 'react';

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col items-start justify-center sm:px-4">
      <Suspense fallback={null}>
        <div className="dark:prose-dark prose my-4 w-full max-w-2xl">
          {children}
        </div>
      </Suspense>
    </article>
  );
}
