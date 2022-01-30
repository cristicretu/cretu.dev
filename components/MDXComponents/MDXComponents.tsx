import DownloadImage from '@components/DownloadImage';
import ExternalLink from '@components/ExternalLink';
import Image from 'next/image';
import Link from 'next/link';
import TwitterAt from '@components/TwitterAt';

const CustomLink = (props: any) => {
  const href = props.href;
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

  if (isInternalLink) {
    return (
      <Link href={href}>
        <a {...props}>{props.children}</a>
      </Link>
    );
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
};

const MDXComponents = {
  Image,
  a: CustomLink,
  TwitterAt,
  DownloadImage,
  ExternalLink
};

export default MDXComponents;
