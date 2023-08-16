import { allWritings } from "@/.contentlayer/generated";
import { MetadataRoute } from "next";

export default function sitemap() {
  const postRoutes = allWritings.map((post) => ({
    lastModified: post.publishedAt,
    // REFACTOR: extract url to a constant or use public env variable
    url: `https://cretu.dev/writing/${post.slug}`,
  }));

  const routes = ['', '/writing'].map((route) => ({
    lastModified: new Date().toISOString().split('T')[0],
    url: `https://cretu.dev${route}`,
  }));

  return [...routes, ...postRoutes] as MetadataRoute.Sitemap;
}
