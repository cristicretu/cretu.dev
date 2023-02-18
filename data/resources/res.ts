interface IResouce {
  title: string
  subtitle: string
  url: string
  image: string
  height?: number
}

export const resources: IResouce[] = [
  {
    title: 'Figma',
    subtitle: 'Icon',
    image: '/static/images/resources/figma.png',
    url: 'https://cristicrtu.gumroad.com/l/figma',
  },
  {
    title: 'Gradient',
    subtitle: 'Wallpapers',
    image: '/static/images/resources/mesh.png',
    url: 'https://cristicrtu.gumroad.com/l/wallpaper',
    height: 64,
  },
  {
    title: 'Ghibli',
    subtitle: 'Drawing',
    image: '/static/images/resources/ghibli.png',
    url: 'https://cristicrtu.gumroad.com/l/ghibli',
  },
  {
    title: 'Sunset',
    subtitle: 'Drawing',
    image: '/static/images/resources/sunset.png',
    url: 'https://cristicrtu.gumroad.com/l/sunset',
    height: 96,
  },
]
