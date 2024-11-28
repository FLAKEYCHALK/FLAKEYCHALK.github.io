import type {
  SiteConfiguration,
  NavigationLinks,
  SocialLinks,
} from "@/types.ts";

export const SITE: SiteConfiguration = {
  title: "CHALK",
  description:
    "CHALK's yapping website",
  url: "https://flakeychalk.github.io",
  author: "CHALK",
  locale: "en-US",
};

export const NAV_LINKS: NavigationLinks = {
  about: {
    path: "/about",
    label: "About",
  },
  blog: {
    path: "/blog",
    label: "Blog",
  },
  projects: {
    path: "/projects",
    label: "Projects",
  },
  contact: {
    path: "/contact",
    label: "Contact",
  },
};

export const SOCIAL_LINKS: SocialLinks = {
  github: {
    label: "GitHub",
    url: "https://github.com/FLAKEYCHALK",
  },
  twitter: {
    label: "Twitter",
    url: "https://x.com/FLAKEYCHALK",
  },
};
