export type WorkCardType = {
  title: string;
  description: string;
  authors?: string[];
  href?: string;
  company?: string;
  img?: string;
  h?: string;
};

export const works: WorkCardType[] = [
  {
    title: "Horizon",
    description: "2023",
    authors: ["Mustafa Abdelhai", "Max Eusterbrock", "Maximilian Heidenreich", "Maximilian Schiller", "Aavash Shrestha", "Ömer Faruk", "Cristian Crețu"],
    img: "/static/images/work/horizon.webp",
    company: "Deta",
    h: "h-96"
  },
  {
    title: "OG Image",
    description: "2023",
    authors: ["Max Eusterbrock", "Maximilian Schiller", "Cristian Crețu"],
    img: "/static/images/work/og.webp",
    company: "Deta",
    h: "h-72"
  },
  {
    title: "Discovery",
    description: "2023",
    authors: ["Mustafa Abdelhai", "Max Eusterbrock", "Maximilian Heidenreich", "Maximilian Schiller", "Aavash Shrestha", "Ömer Faruk", "Cristian Crețu"],
    img: "/static/images/work/discovery.webp",
    company: "Deta",
    h: "h-96"
  },
  {
    title: "Beacon",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/beacon.webp",
    h: "h-96"
  },
  {
    title: "Hanī",
    description: "2023",
    authors: ["Mustafa Abdelhai", "Cristian Crețu"],
    img: "/static/images/work/hani.webp",
    h: "h-96"
  },
  {
    title: "Interactions",
    description: "2023",
    authors: ["Cristian Crețu"],
    company: "Deta",
    img: "/static/images/work/interactions.gif",
    h: "h-96"
  },
  {
    title: "Driving Map",
    description: "2023",
    authors: ["Cristian Crețu"],
    href: "https://driving-map.vercel.app/",
    img: "/static/images/work/driving.webp",
    h: "h-64"
  },
  {
    title: "Bike Tracker",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/bike-tracker.webp",
    h: "h-96"
  },
  {
    title: "Roogle",
    description: "2023",
    authors: ["Cristian Crețu"],
    href: "https://roogle.cretu.dev/",
    img: "/static/images/work/roogle.webp",
    h: "h-96"
  },
  {
    title: "Stacks",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/stacks.webp",
    h: "h-64"
  },
  {
    title: "Kepaia",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/kepaia.gif",
    h: "h-96"
  },
  {
    title: "Flip to Refresh",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/flip.gif",
    h: "h-96"
  },
  {
    title: "The Eyeballing Game",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/eyeballing.webp",
    h: "h-[520px]"
  },
  {
    title: "Cosmic Breathing GLSL",
    description: "2023",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/cosmic.gif",
    h: "h-96"
  },
  {
    title: "Landing Page",
    description: "2023",
    authors: ["Mustafa Abdelhai", "Cristian Crețu"],
    img: "/static/images/work/landing.webp",
    company: "Deta",
    h: "h-96"
  },
  {
    title: "Writer",
    description: "2023",
    authors: ["Cristian Crețu"],
    href: "https://writer.cretu.dev/",
    img: "/static/images/work/writer.webp",
    h: "h-32"
  },
  {
    title: "Radial Lock",
    description: "2023",
    authors: ["Cristian Crețu"],
    href: "https://knob.cretu.dev/",
    img: "/static/images/work/knob.webp",
    h: "h-64"
  },
  {
    title: "Builder",
    description: "2022",
    authors: ["Mustafa Abdelhai", "Max Eusterbrock",  "Maximilian Schiller", "Aavash Shrestha", "Rohan Shiva", "Cristian Crețu"],
    img: "/static/images/work/builder.webp",
    company: "Deta",
    h: "h-96"
  },
  {
    title: "Global Pomodoro Timer",
    description: "2022",
    authors: ["Cristian Crețu"],
    img: "/static/images/work/pomodoro.webp",
    h: "h-96"
  },
  {
    title: "Meshgrad",
    description: "2022",
    authors: ["Cristian Crețu"],
    href: "https://meshgrad.cretu.dev/",
    img: "/static/images/work/meshgrad.webp",
    h: "h-32"
  },
  {
    title: "Light Bulb",
    description: "2022",
    authors: ["Cristian Crețu"],
    href: "https://light.cretu.dev/",
    img: "/static/images/work/light.gif",
    h: "h-72"
  },
  {
    title: "Arc Boost Marketplace",
    description: "2022",
    authors: ["Cristian Crețu"],
    href: "https://arcboost-marketplace.vercel.app/",
    img: "/static/images/work/arc.webp",
    h: "h-72"
  },
  {
    title: "Design System",
    description: "2022",
    authors: ["Mustafa Abdelhai", "Cristian Crețu"],
    img: "/static/images/work/ds.webp",
    company: "Deta",
    h: "h-96"
  },
  {
    title: "Freight Scorer",
    description: "2022",
    authors: ["Cristian Crețu"],
    company: "Esentza Robotics",
    img: "/static/images/work/esentza.webp",
    h: "h-64"
  },
  {
    title: "Romanian Wordle",
    description: "2022",
    authors: ["Cristian Crețu"],
    href: "https://wordle.cretu.dev/",
    img: "/static/images/work/wordle.webp",
    h: "h-36"
  },
  {
    title: "Apartment Visualizer",
    description: "2021",
    authors: ["Horia Ancaș", "Cristian Crețu"],
    company: "Landmarks",
    img: "/static/images/work/landmarks.webp",
    h: "h-64"
  },
  {
    title: "Covid Tracker",
    description: "2021",
    authors: ["Cristian Crețu"],
    href: "https://covid.cretu.dev/",
    img: "/static/images/work/covid.webp",
    h: "h-72"
  },
  {
    title: "Front-End Template",
    description: "2021",
    authors: ["Cristian Crețu"],
    href: "https://template.cretu.dev/",
    img: "/static/images/work/template.webp",
    h: "h-64"
  },
  {
    title: "EPAS Website",
    description: "2020",
    authors: ["Măierean Mircea", "Cristian Crețu"],
    href: "https://cnprbeclean-epas.netlify.app/",
    img: "/static/images/work/epas.webp",
    h: "h-72"
  },
];
