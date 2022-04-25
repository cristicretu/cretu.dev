import { writeFileSync } from 'fs'

import RSS from 'rss'

import { allWritings } from 'contentlayer/generated'

async function generate() {
  const feed = new RSS({
    title: 'Cristian Crețu',
    site_url: 'https://cretu.dev',
    feed_url: `https://cretu.dev/feed.xml`,
  })

  allWritings.map(post => {
    feed.item({
      title: post.title,
      url: `https://cretu.dev/writing/${post.slug}`,
      date: post.publishedAt,
      description: post.summary,
    })
  })

  writeFileSync('./public/feed.xml', feed.xml({ indent: true }))
}

generate()
