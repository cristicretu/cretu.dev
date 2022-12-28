import Image from 'next/image'
import Link from 'next/link'

import DownloadImage from '@components/DownloadImage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLink = (props: any) => {
  const href = props.href
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'))

  if (isInternalLink) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  return <a target='_blank' rel='noopener noreferrer' {...props} />
}

const MDXComponents = {
  Image,
  a: CustomLink,
  DownloadImage,
}

export default MDXComponents
