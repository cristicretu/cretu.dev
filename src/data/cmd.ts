export type Action = {
  name: string;
  shortcut?: string[];
  keywords?: string;
  href?: string;
  section: "Navigation" | "Socials" | "Themes";
  icon?: any;
  subtitle?: string;
  perform?: () => void;
  color?: string;
  iconColor?: string;
};

export const actions: Action[] = [
  {
    name: "Home",
    keywords: "home",
    href: "/",
    section: "Navigation",
    color: "#EC605A",
    iconColor: "#5D0F07",
  },
  {
    name: "Writing",
    keywords: "writing",
    href: "/writing",
    section: "Navigation",
    color: "#F7D358",
    iconColor: "#673D13",
  },
  {
    name: "Highlights",
    keywords: "highlights",
    href: "/work",
    section: "Navigation",
    color: "#FF7F50",
    iconColor: "#673D13",
  },
  {
    name: "Light",
    keywords: "light",
    section: "Themes",
    color: "#EC79F9",
    iconColor: "#5C0E63",
  },
  {
    name: "Dark",
    keywords: "dark",
    section: "Themes",
    color: "#EC79F9",
    iconColor: "#5C0E63",
  },
  {
    name: "System",
    keywords: "system",
    section: "Themes",
    color: "#FF7F50",
    iconColor: "#9f3e1b",
  },
];

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
  {
    name: "Highlights",
    keywords: "highlights",
    href: "/work",
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
];
