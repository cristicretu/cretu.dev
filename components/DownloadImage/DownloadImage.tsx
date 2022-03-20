import React from 'react'

interface DownloadImageProps {
  src: string
  title: string
}

export default function DownloadImage({
  src,
  title,
}: DownloadImageProps): JSX.Element {
  return (
    <a href={src} download={title}>
      Download {title} (5120 x 2880px).
    </a>
  )
}
