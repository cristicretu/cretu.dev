import { allWritings } from '@/.contentlayer/generated';
import { SITE_URL } from '@/lib/constants';
import { MetadataRoute } from 'next';

export default function sitemap() {
  const postRoutes = allWritings.map((post) => ({
    lastModified: post.publishedAt,
    url: `${SITE_URL}/writing/${post.slug}`,
  }));

  const routes = ['', '/writing'].map((route) => ({
    lastModified: new Date().toISOString().split('T')[0],
    url: `${SITE_URL}${route}`,
  }));

  return [...routes, ...postRoutes] as MetadataRoute.Sitemap;
}
