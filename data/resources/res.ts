interface IResouce {
  title: string
  subtitle: string
  url: string
  image: string
  height?: string
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
    url: 'https://cristicrtu.gumroad.com/l/wallpapers',
    height: '256px',
  },
  {
    title: 'Ghibli',
    subtitle: 'Drawing',
    image: '/static/images/resources/ghibli.png',
    url: '/static/images/resources/ghibli.png',
  },
  {
    title: 'Sunset',
    subtitle: 'Drawing',
    image: '/static/images/resources/sunset.png',
    url: '/static/images/resources/sunset.png',
    height: '384px',
  },
]
