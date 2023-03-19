import { Suspense } from "react";

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto sm:px-4">
      <Suspense fallback={null}>
        <div className="w-full my-4 prose dark:prose-dark max-w-2xl">
          {children}
        </div>
      </Suspense>
    </article>
  );
}
