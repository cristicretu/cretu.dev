export interface IMeta {
  title: string
  summary: string
  image: string
  type: string
  publishedAt: string
  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }
  slug: string
}
