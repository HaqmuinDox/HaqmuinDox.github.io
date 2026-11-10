import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Dan",
  lastName: "Cardoz",
  name: `Dan Cardoz`,
  role: "Software Developer",
  avatar: "/images/avatar.jpg", // placeholder "DC" monogram — replace this file with your photo
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
    icon: "x",
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
  image: "/images/og.png",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `${person.name}, a software developer based in Hamburg. Work, writing, and the things I make.`,
  headline: <>Work, writing, and the things I make</>,
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
  subline: <>I'm Dan, a software developer based in Hamburg.</>,
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
    display: true,
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
        I'm a software developer who likes working low in the stack. I profile parallel workloads,
        build native Android apps, and keep Docker containers running. I also host my own
        infrastructure: a private cloud behind a VPN that I run end to end. You understand a system
        best once you are the one keeping it online.
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
            Worked on seven internal business apps built with Microsoft PowerApps and Power
            Automate, automating administrative tasks that had previously been handled manually.
          </>,
          <>
            Helped develop the company's IT asset lifecycle process (secure data wiping,
            refurbishment, resale), which I still help maintain, and administer company devices
            through Apple Business Manager.
          </>,
        ],
        images: [],
      },
      {
        company: "Rohlfs Bäckerei",
        timeframe: "Jun 2022 - May 2023",
        role: "Part-time Salesperson",
        achievements: [
          <>Served customers and sold baked goods behind the counter.</>,
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
            BSc Computer Science, expected March 2027. Coursework in data structures &
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
            I run a 24/7 private cloud on a small Ubuntu box: Nextcloud, Immich, Vaultwarden and a
            dozen other services, all behind a Tailscale VPN with Caddy terminating HTTPS
            internally. I work with Docker and Linux daily and keep stateful services healthy.
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
