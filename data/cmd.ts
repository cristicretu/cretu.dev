export type Action = {
  name: string;
  shortcut?: string[];
  keywords?: string;
  href?: string;
  section: "Navigation" | "Socials" | "Themes";
  icon?: JSX.Element;
  subtitle?: string;
  perform?: () => void;
};

export const Navigation: Action[] = [
  {
    name: "Home",
    keywords: "home",
    href: "/",
    section: "Navigation",
  },
  {
    name: "Writing",
    keywords: "writing",
    href: "/writing",
    section: "Navigation",
  },
];

export const Socials: Action[] = [
  {
    name: "GitHub",
    keywords: "github",
    perform: () => {
      window.open("https://github.com/cristicretu");
    },
    section: "Socials",
  },
  {
    name: "Twitter",
    keywords: "twitter",
    perform: () => {
      window.open("https://twitter.com/cristicrtu");
    },
    section: "Socials",
  },
];

export const Themes: Action[] = [
  {
    name: "Light",
    keywords: "light",
    section: "Themes",
  },
  {
    name: "Dark",
    keywords: "dark",
    section: "Themes",
  },
  {
    name: "System",
    keywords: "system",
    section: "Themes",
  },
];
