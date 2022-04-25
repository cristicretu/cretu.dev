export const baseUrl =
  process.env.NODE_ENV === 'production' ? 'https://cretu.dev' : ''

export const defaultSEO = {
  title: 'Crețu Cristian',
  description: 'Developer and designer.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    site_name: 'Crețu Cristian',
    images: [
      {
        url: `${baseUrl}/static/og/default.png`,
        alt: 'Crețu Cristian',
      },
    ],
  },
  twitter: {
    handle: '@cristicrtu',
    site: '@cristicrtu',
    cardType: 'summary_large_image',
  },
}

interface IExtendSEO {
  title?: string
  description?: string
  image?: string
  url?: string
}

export function extendSEO(options: IExtendSEO) {
  const images = options.image
    ? [{ url: `${baseUrl}/static/${options.image}` }]
    : defaultSEO.openGraph.images

  return {
    ...defaultSEO,
    ...options,
    url: `${baseUrl}/${options.url}`,
    openGraph: {
      ...defaultSEO.openGraph,
      images,
      url: `${baseUrl}/${options.url}`,
    },
  }
}
