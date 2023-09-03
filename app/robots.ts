import { SITE_URL } from '@/lib/constants';

export default function robots() {
  return {
    host: SITE_URL,
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
