import ExternalLink from './ExternalLink';
import Flashcard from './Flashcard';
import { useMDXComponent } from 'next-contentlayer/hooks';
import Image from 'next/image';
import Link from 'next/link';

const CustomLink = (props: any) => {
  const href = props.href;
  const isInternalLink = href && href.startsWith('/');

  if (isInternalLink) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return <a {...props} />;
  }

  return <ExternalLink href={href} {...props} />;
};

const MDXComponents = {
  Flashcard,
  Image,
  a: CustomLink,
};

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);

  return (
    <article className="prose-quoteless prose prose-neutral dark:prose-invert">
      <Component components={{ ...MDXComponents } as any} />
    </article>
  );
}

export default MDXComponents;
