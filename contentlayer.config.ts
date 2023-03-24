import {
  ComputedFields,
  defineDocumentType,
  makeSource,
} from 'contentlayer/source-files';
import readingTime from 'reading-time';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode, { Options } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const rehypePrettyCodeOptions: Partial<Options> = {
  onVisitHighlightedLine(node) {
    node.properties.className.push('syntax-line--highlighted');
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['syntax-word--highlighted'];
  },
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode, and
    // allow empty lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
    node.properties.className.push('syntax-line');
  },
  theme: 'poimandres',
  tokensMap: {
    // VScode command palette: Inspect Editor Tokens and Scopes
    // https://github.com/Binaryify/OneDark-Pro/blob/47c66a2f2d3e5c85490e1aaad96f5fab3293b091/themes/OneDark-Pro.json
    fn: 'entity.name.function',
    objKey: 'meta.object-literal.key',
  },
};

const computedFields: ComputedFields = {
  readingTime: { resolve: (doc) => readingTime(doc.body.raw), type: 'json' },
  slug: {
    resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ''),
    type: 'string',
  },
  structuredData: {
    resolve: (doc) => ({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      author: {
        '@type': 'Person',
        name: 'Cristian Crețu',
      },
      dateModified: doc.publishedAt,
      datePublished: doc.publishedAt,
      description: doc.summary,
      headline: doc.title,
      image: doc.image
        ? `https://cretu.dev${doc.image}`
        : `https://cretu.dev/static/images/og.png`,
      url: `https://cretu.dev/writing/${doc._raw.flattenedPath}`,
    }),
    type: 'json',
  },
  wordCount: {
    resolve: (doc) => doc.body.raw.split(/\s+/gu).length,
    type: 'number',
  },
};

const Writing = defineDocumentType(() => ({
  computedFields,
  contentType: 'mdx',
  fields: {
    image: { required: true, type: 'string' },
    publishedAt: { required: true, type: 'string' },
    summary: { required: true, type: 'string' },
    title: { required: true, type: 'string' },
  },
  filePathPattern: 'writing/*.mdx',
  name: 'Writing',
}));

const contentLayerConfig = makeSource({
  contentDirPath: 'data',
  documentTypes: [Writing],
  mdx: {
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
    remarkPlugins: [remarkGfm],
  },
});

export default contentLayerConfig;
