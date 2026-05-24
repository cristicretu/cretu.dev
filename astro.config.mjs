import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

// Tiny rehype plugin: every <img> in MDX gets loading="lazy" and
// decoding="async" so post body images don't block first paint.
function rehypeLazyImages() {
  function walk(node) {
    if (!node) return;
    if (node.type === 'element' && node.tagName === 'img') {
      node.properties = node.properties || {};
      if (node.properties.loading == null) node.properties.loading = 'lazy';
      if (node.properties.decoding == null) node.properties.decoding = 'async';
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }
  return (tree) => walk(tree);
}

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
      rehypeLazyImages,
    ],
  },
});
