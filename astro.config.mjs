import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const rehypePrettyCodeOptions = {
  theme: 'poimandres',
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
    node.properties.className = node.properties.className || [];
    node.properties.className.push('syntax-line');
  },
  onVisitHighlightedLine(node) {
    node.properties.className = node.properties.className || [];
    node.properties.className.push('syntax-line--highlighted');
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['syntax-word--highlighted'];
  },
  tokensMap: {
    fn: 'entity.name.function',
    objKey: 'meta.object-literal.key',
  },
};

export default defineConfig({
  site: 'https://cretu.dev',
  integrations: [
    tailwind(),
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, rehypePrettyCodeOptions],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
});
