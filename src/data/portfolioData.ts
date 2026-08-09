export interface PortfolioData {
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  achievements: Achievement[];
  contact: ContactInfo;
  colors: ColorScheme;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  photo: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter?: string;
    website?: string;
  };
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  logo: string;
  location: string;
  website?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
  logo?: string;
  location: string;
  gpa?: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: number;
  icon?: string;
  color?: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  demoLink?: string;
  sourceLink?: string;
  featured: boolean;
}

export interface Achievement {
  title: string;
  date: string;
  description: string;
  icon?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsUserId: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  dark: {
    background: string;
    surface: string;
    text: string;
  };
  light: {
    background: string;
    surface: string;
    text: string;
  };
}

export const WorkData: WorkExperience[] = [
  {
    company: "ECAM | GardaWorld",
    position: "Full Stack Developer – Full Time",
    startDate: "Feb-2026",
    endDate: "Present",
    description:
      "Building highly available enterprise applications across Angular, Node.js, and PostgreSQL for operational teams — with AI-assisted delivery, Azure cost control, and live-streaming reliability.",
    achievements: [
      "Developed and maintained enterprise applications using Angular (v15), Node.js (v20+), and PostgreSQL for highly available operational services",
      "Built Azure DevOps CI/CD pipelines with Mocha and Playwright testing, integrating Snyk to prevent security vulnerabilities",
      "Audited Azure resources (Container Apps, PostgreSQL, VMs, Redis Cache) and reduced recurring monthly infrastructure spend by 18%",
      "Integrated Salesforce data streams into enterprise platforms for interactive, real-time analytical insights",
      "Debugged WebRTC and MediaTek bottlenecks in large-scale live streaming, stabilizing thousands of concurrent streams at 99.9% uptime",
      "Spearheaded an organization-wide Cursor and GitHub Copilot pilot that boosted developer productivity by 60%",
      "Shipped an AI-driven Figma MCP design-to-code workflow that delivered a modular, TDD-backed Angular (v22) app in 2 weeks for under $25 in API token costs",
      "Owned end-to-end agile delivery of 3 new enterprise applications with a plugin-based architecture for rapid extensibility",
      "Earned formal recognition within 6 months for prioritizing cost-effective solutions and fostering a company-wide growth mindset",
      "Mentored interns and cross-functional teammates through technical demos and knowledge-sharing sessions",
    ],
    logo: new URL(`/public/assets/images/ecam.png`, import.meta.url).href,
    location: "Hamilton, ON, Canada",
  },
  {
    company: "Nuclear Promise X",
    position: "Innovation Catalyst, Full Stack Developer – Full Time",
    startDate: "Jul-2025",
    endDate: "Dec-2025",
    description:
      "Accelerated delivery with agentic AI, modernized React architecture, and raised engineering quality bars across a remote full-stack team.",
    achievements: [
      "Used agentic AI and GitHub Actions to accelerate delivery 20% and provide deeper, high-value PR reviews",
      "Modernized a React codebase with context providers, custom hooks, and components, reducing prop drilling 30% and easing maintenance",
      "Converted editable components into read-only views via switch-based routing, enabling safe data access for 3 roles with zero regressions",
      "Standardized React/Node.js patterns and added Husky + lint-staged pre-commit checks to block 90% of broken commits",
    ],
    logo: new URL(`/public/assets/images/npx.jpg`, import.meta.url).href,
    location: "Remote, ON, Canada",
    website: "https://www.npxinnovation.ca/",
  },
  {
    company: "Freelance",
    position: "Freelance Full Stack React Developer – Part Time",
    startDate: "Aug-2023",
    endDate: "Dec-2025",
    description:
      "Shipped production SaaS, booking platforms, and AI products for clients — from Stripe revenue stacks to mentorship at a winning Google AI Hackathon entry.",
    achievements: [
      "Cut data rendering times by 35% in a Plotly.js and OpenGL app using GenAI and React tweaks",
      "Built an AI chatbot with OpenAI + Next.js that raised engagement by 30% via personalized replies",
      "Implemented CI/CD via GitHub Actions, reducing manual deployment effort by 40%",
      "Integrated Jest, React Testing Library, and Cypress, boosting coverage by 30% and cutting QA turnaround by 25%",
      "Deployed to AWS EC2/S3/Lambda and Azure App Services with Grafana & Datadog monitoring at 99.9% uptime",
      "Integrated Contentful CMS and Shopify Plus over GraphQL, lifting conversion by 12%",
      "Built a headless-CMS blog with GraphQL, Apollo Client, and Next.js SSR, cutting page load by 30%",
      "Designed and shipped World Sports Academy — a Next.js 15 court-booking platform with 24 pages, 22 API handlers, and a 15-table PostgreSQL schema under 53 RLS policies",
      "Implemented the full Stripe revenue stack (subscriptions, Payment Intents with 3-D Secure, portal, refunds, idempotent webhooks) with Twilio, Resend, and Slack alerting",
      "Mentored a junior team to a winning Google AI Hackathon entry for a voice-first elderly-care companion",
    ],
    logo: new URL(`/public/assets/images/freelance.jpg`, import.meta.url).href,
    location: "Remote",
  },
  {
    company: "SOTI Inc.",
    position: "DevOps Engineer Coop – Full Time",
    startDate: "May-2024",
    endDate: "Dec-2024",
    description:
      "Engineered cloud CI/CD pipelines and toolchain automation across Jenkins, Azure, and multi-cloud VM image workflows.",
    achievements: [
      "Developed end-to-end cloud CI/CD pipelines in Jenkins using Groovy scripting, reducing deployment times by 30%",
      "Automated PowerShell-based reindexing scripts for JFrog Xray vulnerability scans, reducing manual effort by 40%",
      "Improved BDD testing frameworks by fixing Angular.js & .NET UI issues",
      "Migrated VM image creation jobs from GoCD to Jenkins across AWS, Azure, and local servers, cutting build time by 40%",
      "Operated the full toolchain — Jira, Jenkins, GoCD, JFrog Artifactory & Xray, Vault, GitHub Enterprise, Azure DevOps, and Zabbix",
    ],
    logo: new URL(`/public/assets/images/soti.jpg`, import.meta.url).href,
    location: "Mississauga, ON, Canada",
    website: "https://www.soti.net",
  },
  {
    company: "Soliton Technologies",
    position: "Senior Project Engineer – Full Time",
    startDate: "Jun-2022",
    endDate: "Jul-2023",
    description:
      "Led industrial IoT and cinema-robotics delivery in partnership with NI — micro-frontends, Three.js simulation, and secure Node.js microservices.",
    achievements: [
      "Architected micro-frontends for an Industrial IoT monitoring dashboard with React.js, TypeScript, Redux Toolkit, Material UI, and D3.js — cutting bundle size 30% and improving TTI 25%",
      "Designed and built a 3D robot motion simulator with Three.js, spatial analytics, and real-time path planning that drove stakeholder buy-in",
      "Integrated secure MongoDB-backed Node.js REST APIs with OAuth 2.0/JWT and WebSocket streaming, reducing response times by 25%",
      "Standardized React.js structures across teams, reducing technical debt and lifting sprint velocity by 15%",
      "Owned Agile end-to-end delivery of a cinema-robotics project spanning React.js, Node.js, LabVIEW, C++, and Python",
      "Delivered a multi-lingual HMI for a knife-sharpening system in close collaboration with UI/UX and stakeholders",
      "Built internal resource and asset management software with React.js, Node.js, PostgreSQL, and AWS",
      "Authored the organization's pull-request checklist and conventional commit standard",
      "Led Knowledge Sharing Sessions on OPC UA, MQTT, and AWS IoT Core",
    ],
    logo: new URL(`/public/assets/images/soliton.jpg`, import.meta.url).href,
    location: "Tamil Nadu, India",
    website: "https://www.solitontech.com",
  },
  {
    company: "Soliton Technologies",
    position: "Project Engineer – Full Time",
    startDate: "Aug-2020",
    endDate: "Jun-2022",
    description:
      "Delivered semiconductor validation tooling, big-data anomaly pipelines, and Industrial IoT edge modules on React, Electron, and Azure.",
    achievements: [
      "Built a validation dashboard with React.js, Redux (Saga), Electron, and Chart.js, reducing test cycles by 40%",
      "Introduced TDD with Jest & React Testing Library, improving UI reliability by 30%",
      "Optimized Redux slices and lazy loading, cutting initial load times by 65%",
      "Engineered an Elastic Stack / AWS ELK PoC ingesting 5M+ semiconductor logs/day — 2nd place in an internal hackathon",
      "Led a 3-person ML anomaly-detection module for waveform analysis, reducing loss by up to 35%",
      "Delivered an Industrial IoT edge module with Docker and Python bridging OPC UA to Azure",
      "Tailored Scrum events for cinema-robotics, raising story-point completion by 30%",
    ],
    logo: new URL(`/public/assets/images/soliton.jpg`, import.meta.url).href,
    location: "Tamil Nadu, India",
    website: "https://www.solitontech.com",
  },
  {
    company: "Soliton Technologies",
    position: "Project Engineer – Intern",
    startDate: "Jan-2020",
    endDate: "Mar-2020",
    description:
      "Trained in LabVIEW and shipped real-time application prototypes that secured a full-time offer.",
    achievements: [
      "Built real-time LabVIEW applications (virtual calculator, flight booking, ATM) that exceeded expectations and converted to a full-time role",
    ],
    logo: new URL(`/public/assets/images/soliton.jpg`, import.meta.url).href,
    location: "Tamil Nadu, India",
    website: "https://www.solitontech.com",
  },
  {
    company: "Zoho Corporation",
    position: "Backend Developer – Intern",
    startDate: "May-2019",
    endDate: "Jun-2019",
    description:
      "Contributed to Zoho Assist backend development while ramping quickly on Java and agile workflows.",
    achievements: [
      "Earned recognition for rapid learning while developing core Java backend modules for Zoho Assist",
    ],
    logo: new URL(`/public/assets/images/zoho_corp.jpg`, import.meta.url).href,
    location: "Chennai, India",
    website: "https://www.zoho.com",
  },
];

export const SkillsData: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      { name: "React.js", level: 95 },
      { name: "TypeScript", level: 92 },
      { name: "Next.js", level: 90 },
      { name: "Angular", level: 85 },
      { name: "Redux / Zustand", level: 88 },
      { name: "Tailwind / MUI", level: 90 },
      { name: "Three.js / R3F", level: 80 },
    ],
  },
  {
    category: "Backend & APIs",
    skills: [
      { name: "Node.js", level: 92 },
      { name: "Python / FastAPI", level: 85 },
      { name: "PostgreSQL", level: 88 },
      { name: "GraphQL / REST", level: 88 },
      { name: "Prisma / Knex", level: 82 },
      { name: "Stripe / Auth", level: 85 },
    ],
  },
  {
    category: "AI & LLM",
    skills: [
      { name: "Multi-agent systems", level: 90 },
      { name: "RAG / Vector search", level: 88 },
      { name: "LangChain / LangGraph", level: 82 },
      { name: "MCP tooling", level: 85 },
      { name: "OpenAI / Claude / Gemini", level: 90 },
    ],
  },
  {
    category: "Cloud & DevOps",
    skills: [
      { name: "Azure", level: 85 },
      { name: "AWS", level: 80 },
      { name: "Docker", level: 88 },
      { name: "CI/CD", level: 90 },
      { name: "Terraform", level: 72 },
      { name: "Playwright / Jest", level: 85 },
    ],
  },
];

export const MarketingData = {
  headline:
    "Senior full-stack developer shipping React, Node.js, and production AI systems across enterprise, IoT, and SaaS.",
  tagline:
    "Six-plus years of measurable impact: 18% cloud cost reduction, 99.9% streaming uptime, 60% developer productivity gains from AI-assisted workflows, and 65% faster initial loads — from industrial edge to multi-agent platforms.",
  /** Short labels orbiting the hero portrait in 3D (keep concise for readability). */
  heroOrbitLabels: [
    "AI & Agentic Systems",
    "React & Next.js",
    "Node.js & APIs",
    "Cloud & DevOps",
    "RAG & MCP",
    "Angular & TypeScript",
    "PostgreSQL",
    "Stripe & SaaS",
    "Industrial IoT",
  ],
  proofPoints: [
    { metric: "18%", label: "Azure infra spend reduced at ECAM" },
    { metric: "60%", label: "dev productivity lift from AI pilot" },
    { metric: "99.9%", label: "uptime across live streaming & cloud" },
  ],
  pillars: [
    "Production AI/LLM systems — multi-agent orchestration, RAG, and MCP tooling",
    "Full-stack product delivery on React/Next.js, Node.js, and PostgreSQL",
    "Cloud cost, CI/CD, and observability on Azure and AWS",
  ],
  primaryCta: { label: "Start a conversation", href: "#contact" },
  secondaryCta: { label: "View classic portfolio", href: "/" },
  /** Short copy for the career “telescope” experience (ECAM + future framing). */
  telescope: {
    ecamCompany:
      "ECAM (GardaWorld) builds enterprise security and operations software — highly available services, live streaming at scale, and integrations that keep field and ops teams effective.",
    ecamRole:
      "I ship Angular and Node.js features, Azure CI/CD, Salesforce analytics, and AI-assisted delivery workflows — with formal recognition inside six months for impact and mentorship.",
    futureBlurb:
      "The empty map ahead: deeper platform ownership, research-grade agentic products, and collaborations where craft and narrative both matter. Not a destination — a direction.",
  },
};

/** Product offerings spotlighted on the portfolio — flagship first. */
export const OfferingsData = {
  flagship: {
    name: "InfoSentry",
    tagline: "Your personal multi-agent intelligence layer.",
    description:
      "A self-hosted multi-agent AI platform (~24k LOC) that discovers, scrapes, summarises, and forecasts news across discovery engines, GitHub, and YouTube — with budget-aware model routing under $7.30/month LLM spend.",
    marketingUrl: "https://sentry.harieshwar.dev",
    sourceUrl: "https://github.com/HariEshwar-J-A/info-sentry",
    accent: "#6366f1",
    badges: ["Multi-agent", "RAG", "Self-hosted"],
    stats: [
      { value: "8", label: "LLM agents" },
      { value: "55", label: "REST endpoints" },
      { value: "$7.30", label: "Max LLM / month" },
      { value: "0", label: "Ads. Ever." },
    ],
    modules: [
      {
        key: "iFeeds",
        blurb: "AI-curated news scoped to your topics, with summaries, sentiment, and predictions.",
      },
      {
        key: "iChat",
        blurb: "Converse with your intelligence layer — grounded in everything it has read for you.",
      },
      {
        key: "iGitHub",
        blurb: "Repo discovery and GitHub trend tracking tuned to your stack.",
      },
      {
        key: "iVideos",
        blurb: "Video digests distilled from the channels that actually matter to you.",
      },
      {
        key: "iSurprise",
        blurb: "A serendipity engine surfacing high-signal finds outside your usual orbit.",
      },
    ],
  },
};

export const portfolioData: PortfolioData = {
  personal: {
    name: "Harieshwar J A",
    title: "Senior Full-Stack Developer",
    bio: "Senior Full-Stack Developer with 6+ years delivering production web platforms across enterprise security, industrial IoT, and consumer SaaS. Builds React/Next.js and TypeScript front ends, Node.js APIs on PostgreSQL, and production AI/LLM systems — multi-agent orchestration, RAG, vector search, and MCP tooling — on Azure and AWS.",
    photo: new URL(`/public/assets/images/profile-picture.jpg`, import.meta.url)
      .href,
    socialLinks: {
      github: "https://github.com/HariEshwar-J-A",
      linkedin: "https://www.linkedin.com/in/harieshwar-ja/",
      website: "https://harieshwar.dev/",
    },
  },
  experience: WorkData,
  education: [
    {
      institution: "McMaster University",
      degree: "Master of Engineering in Systems & Technology",
      field: "Automation & Smart Systems (Co-Op)",
      startDate: "2023",
      endDate: "2025",
      description:
        "Relevant coursework: Prototyping Web & Mobile Applications (Ruby on Rails), Industrial IoT, Total Sustainability Management",
      logo: new URL(`/public/assets/images/mcmaster.jpg`, import.meta.url).href,
      location: "Hamilton, ON, Canada",
      gpa: "3.9/4.0",
    },
    {
      institution: "Anna University — RMD Engineering College",
      degree: "Bachelor of Engineering",
      field: "Electrical and Electronics Engineering",
      startDate: "2016",
      endDate: "2020",
      description:
        "Relevant coursework: Object Oriented Programming and Lab (Data Structures and Algorithms)",
      logo: new URL(
        `/public/assets/images/anna_university.jpg`,
        import.meta.url
      ).href,
      location: "Chennai, India",
      gpa: "3.54/4.0",
    },
  ],
  skills: SkillsData,
  projects: [
    {
      title: "Info Sentry",
      description:
        "Self-hosted multi-agent AI intelligence platform (~24,000 LOC, 186 files) that autonomously discovers, scrapes, summarises, and forecasts news across 4 discovery engines, GitHub, and YouTube. Eight LLM agents behind OpenClaw with budget-aware 4-tier model routing under $7.30/month, RAG on ChromaDB, and a Next.js 15 dashboard with 55 REST endpoints and SSE streaming.",
      technologies: [
        "Next.js 15",
        "React 19",
        "TypeScript",
        "PostgreSQL",
        "Prisma",
        "ChromaDB",
        "OpenClaw",
        "OpenRouter",
        "FastAPI",
        "Docker Compose",
        "Cloudflare Tunnel",
      ],
      image: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg",
      demoLink: "https://sentry.harieshwar.dev",
      sourceLink: "https://github.com/HariEshwar-J-A/info-sentry",
      featured: true,
    },
    {
      title: "World Sports Academy",
      description:
        "Production Next.js 15 court-booking and membership platform for a Toronto sports academy (~26,000 LOC): 24 pages, 22 API route handlers, ~40 server actions, and a 15-table PostgreSQL schema under 53 RLS policies. Full Stripe revenue stack, timezone-aware availability engine, Supabase Realtime admin dashboard, and installable PWA.",
      technologies: [
        "Next.js 15",
        "React 19",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
        "Stripe",
        "Twilio",
        "Resend",
        "shadcn/ui",
        "Vitest",
        "Vercel",
      ],
      image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg",
      demoLink: "https://worldsportsacademy.com",
      featured: true,
    },
    {
      title: "node-jhora",
      description:
        "Seven-package TypeScript monorepo (~12,500 LOC) delivering a professional astronomical and Vedic astrology computation SDK. Pure-TypeScript JPL DE440s SPK ephemeris reader (no Swiss Ephemeris copyleft), 16 divisional charts, Shadbala, Ashtakavarga, 4 Dasha systems, 263 Jest tests, and a Fastify + Zod REST API.",
      technologies: [
        "TypeScript",
        "NPM Workspaces",
        "Fastify",
        "Zod",
        "decimal.js",
        "Luxon",
        "Jest",
        "JPL DE440s",
      ],
      image: "https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg",
      sourceLink: "https://github.com/HariEshwar-J-A/node-jhora",
      featured: true,
    },
    {
      title: "HoraMind & JyotishBase",
      description:
        "Autonomous Telegram AI agent fusing live node-jhora chart computation with RAG-grounded classical interpretation. Four custom agent tools, ~6,600 ChromaDB embeddings from JyotishBase (~20,900 lines), and cost-tiered routing between Gemini Flash and Claude Sonnet.",
      technologies: [
        "Node.js 22",
        "OpenClaw",
        "OpenRouter",
        "ChromaDB",
        "Transformers.js",
        "Telegram Bot API",
      ],
      image: "https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/HoraMind",
      featured: true,
    },
    {
      title: "Portfolio Website",
      description:
        "~9,600 LOC TypeScript engineering site with HARI.AI persona layer, intent-based personalisation, Cmd/Ctrl+K command palette, lazy-loaded React Three Fiber 3D route, /ai mini-game playground, Plotly career map, and EmailJS collaboration wizard — deployed on Netlify.",
      technologies: [
        "React 18",
        "TypeScript",
        "Vite",
        "Redux Toolkit",
        "Redux-Saga",
        "Three.js",
        "Framer Motion",
        "Lenis",
        "Plotly.js",
        "Netlify",
      ],
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
      demoLink: "https://harieshwar.dev",
      sourceLink: "https://github.com/HariEshwar-J-A/portfolio",
      featured: true,
    },
    {
      title: "Expense Tracker",
      description:
        "Full-stack finance platform (~7,200 LOC, 24 REST endpoints) with JWT HttpOnly auth, two-tier OCR receipt ingestion, Knex adapters for SQLite/PostgreSQL, D3.js analytics (safe-to-spend and velocity), and PDFKit report generation.",
      technologies: [
        "React 19",
        "Vite",
        "Material UI",
        "D3.js",
        "Express 5",
        "Knex.js",
        "SQLite",
        "PostgreSQL",
        "JWT",
        "PDFKit",
      ],
      image: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/expense-tracker",
      featured: false,
    },
    {
      title: "Habit Tracker PWA",
      description:
        "Installable Progressive Web App with Supabase PKCE OAuth (Google, GitHub, email), server-side streak computation via PL/pgSQL triggers, 10 accent themes in Dexie/IndexedDB, and Workbox offline caching — first release in 5 days across 142 commits.",
      technologies: [
        "React 18",
        "TypeScript",
        "Supabase",
        "Zustand",
        "Dexie",
        "Vite-PWA",
        "Material UI",
        "Framer Motion",
      ],
      image: "https://images.pexels.com/photos/374720/pexels-photo-374720.jpeg",
      demoLink: "https://trackmyhabit.netlify.app",
      sourceLink: "https://github.com/HariEshwar-J-A/habit-tracker",
      featured: false,
    },
    {
      title: "Valorant Spike Timer",
      description:
        "Transparent Overwolf in-game overlay that auto-starts a 45-second countdown on bomb-plant detection, cancels on defuse or round end, and plays a Web Audio warning at the 10-second threshold — with configurable settings and a browser demo mode.",
      technologies: ["React 18", "Vite", "Overwolf SDK", "Web Audio API"],
      image: "https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/valorant-spike-timer_overwolf",
      featured: false,
    },
    {
      title: "BridgeCare — Google AI Hackathon",
      description:
        "Technical mentor for a winning voice-first elderly-care companion: 6-model Gemini fallback chain, trigger-phrase memory extraction with 50-memory contextual retrieval, Web Speech capture with silence detection, and healthcare-adjacent safety constraints.",
      technologies: [
        "React 19",
        "TypeScript",
        "Express 5",
        "Google Gemini",
        "Web Speech API",
        "Recharts",
      ],
      image: "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg",
      featured: false,
    },
  ],
  achievements: [
    {
      title: "ECAM Formal Recognition",
      date: "2026",
      description:
        "Recognized within 6 months at ECAM | GardaWorld for driving project success, cost-effective technical prioritization, and a company-wide growth mindset",
    },
    {
      title: "Google AI Hackathon — Winning Mentor",
      date: "2026",
      description:
        "Mentored a junior developer team to a winning BridgeCare entry: voice-first elderly-care companion with Gemini agent architecture and safety constraints",
    },
    {
      title: "LangChain Academy",
      date: "2026",
      description:
        "Completed Introduction to LangChain (Python): LangGraph agent workflows, MCP servers, RAG pipelines, multi-agent systems, and human-in-the-loop middleware",
    },
    {
      title: "Star Soliton Award",
      date: "2023",
      description:
        "Received two Star Soliton awards for exceptional hard work and significant value addition to projects",
    },
    {
      title: "Best Alumni (2020 – 2023)",
      date: "2023",
      description:
        "Won Best Alumni from R.M.D Engineering College for training students and faculty in software engineering and guiding technical research",
    },
    {
      title: "Internal Hackathon — 2nd Place",
      date: "2021",
      description:
        "Second place for an Elastic Stack / AWS ELK PoC ingesting 5M+ semiconductor logs/day, helping secure a major partner offering",
    },
    {
      title: "Chess Team Captain",
      date: "2016 – 2020",
      description:
        "Led RMDEC Boys Chess team to top-3 zonal finishes for 3 consecutive years; board prizes every year; grew the program from 4 to 50 players",
    },
  ],
  contact: {
    email: "harieshwarja.official@gmail.com",
    location: "Toronto, ON",
    emailjsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    emailjsUserId: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  },
  colors: {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F97316",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    dark: {
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F1F5F9",
    },
    light: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
    },
  },
};
