import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const SITE = 'https://cretu.dev';
const TITLE = 'Cristian Crețu';
const DESCRIPTION = 'thoughts on design, code, and life — from cretu.dev';

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection('writing')).sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  const items = posts
    .map((post) => {
      const cleanedTitle = post.data.title.replace(/[.!?]+$/, '').toLowerCase();
      const url = `${SITE}/writing/${post.slug}`;
      const pubDate = new Date(post.data.publishedAt).toUTCString();
      const summary = post.data.summary || '';
      return `    <item>
      <title>${escapeXml(cleanedTitle)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(summary)}</description>
    </item>`;
    })
    .join('\n');

  const now = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${TITLE}</title>
    <link>${SITE}</link>
    <description>${DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
