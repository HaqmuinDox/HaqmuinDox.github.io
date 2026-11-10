import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Dan",
  lastName: "Cardoz",
  name: `Dan Cardoz`,
  role: "Software Engineer",
  avatar: "", // drop a photo at public/images/avatar.jpg and set this to "/images/avatar.jpg"
  email: "contact@dancardoz.de",
  location: "Europe/Berlin", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "German"], // optional: Leave the array empty if you don't want to display languages
  locale: "en", // BCP 47 language tag for the HTML lang attribute, e.g., 'en', 'ja', 'zh-TW'
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>Occasional notes on self-hosting, systems and tooling.</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Set essential: true for links you want to show on the about page
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/HaqmuinDox",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/dan-cardoz-9a2642253/",
    essential: true,
  },
  {
    name: "X",
    icon: "twitter",
    link: "https://x.com/dan_cardoz",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/dan_cardoz/",
    essential: false,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio of ${person.name}, a software engineer focused on systems, self-hosting and clean tooling.`,
  headline: <>Systems, self-hosting, and software I actually own</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">jtx Desktop</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/jtx-desktop",
  },
  subline: (
    <>
      I'm Dan, a software engineer focused on systems, self-hosting and clean tooling. I build
      things that run quietly and reliably <br /> — from Android apps to a private cloud humming
      24/7.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} based in Hamburg`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: false, // no photo yet — drop one at public/images/avatar.jpg and flip this to true
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I'm a software engineer who likes getting close to the metal. Whether it's profiling
        parallel workloads, wiring up native Android apps, or keeping a fleet of Docker containers
        healthy, I care about software that's fast, understandable and genuinely owned. Outside of
        shipping features I run my own infrastructure end to end — a self-hosted private cloud
        behind a VPN — because the best way to understand a system is to be the one keeping it alive
        at 3am.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "Wempe",
        timeframe: "Jul 2023 - Present",
        role: "Working Student",
        achievements: [
          <>
            Designed and deployed 5+ internal business apps with Microsoft PowerApps and Power
            Automate, reducing manual administrative workflows by 20%.
          </>,
          <>
            Led the company-wide IT asset lifecycle initiative (secure data wiping, refurbishment,
            resale) and administered enterprise mobile infrastructure via Apple Business Manager.
          </>,
        ],
        images: [],
      },
      {
        company: "Rohlfs Bäckerei",
        timeframe: "Jun 2022 - May 2023",
        role: "Part-time Salesperson",
        achievements: [
          <>Managed inventory and served customers in a fast-paced retail environment.</>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "University of Hamburg",
        description: (
          <>
            BSc Computer Science, expected September 2026. Coursework in data structures &
            algorithms, database systems, high-performance computing, statistics, and theoretical
            computer science.
          </>
        ),
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Systems & self-hosting",
        description: (
          <>
            Running a 24/7 private cloud on Ubuntu — Nextcloud, Vaultwarden, n8n and a full Dawarich
            stack, all behind a Tailscale VPN. Comfortable with Docker, Linux and keeping stateful
            services healthy.
          </>
        ),
        tags: [
          { name: "Linux", icon: "linux" },
          { name: "Docker", icon: "docker" },
          { name: "PostgreSQL", icon: "postgresql" },
          { name: "Redis", icon: "redis" },
        ],
        images: [],
      },
      {
        title: "Languages & tooling",
        description: (
          <>
            Python, Java, C++ and JavaScript day to day, plus SQL, DataWeave and LaTeX. I profile
            parallel C++ with TAU and perf, and build MuleSoft integrations in Anypoint Studio.
          </>
        ),
        tags: [
          { name: "Python", icon: "python" },
          { name: "C++", icon: "cplusplus" },
          { name: "JavaScript", icon: "javascript" },
          { name: "Git", icon: "git" },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Writing",
  title: "Writing & notes",
  description: `Notes on self-hosting, systems and tooling by ${person.name}`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Software and systems projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/work/projects
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [],
};

export { person, social, newsletter, home, about, blog, work, gallery };
