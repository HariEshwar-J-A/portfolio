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
    company: "Freelance",
    position: "Freelance React Developer – Part Time",
    startDate: "Aug-2023",
    endDate: "Present",
    description:
      "Delivered optimized web solutions and innovative features as an independent contractor.",
    achievements: [
      "Cut data rendering times by 35% in a Plotly.js and OpenGL app using GenAI and React tweaks, boosting responsiveness and user delight",
      "Built an AI chatbot with OpenAI + Next.js, harnessing GenAI for NLP, raising engagement by 30% via personalized replies",
      "Implemented CI/CD pipelines via GitHub Actions, reducing manual deployment efforts by 40%",
      "Integrated Jest, React Testing Library, and Cypress, boosting test coverage by 30% and reducing QA turnaround by 25%",
      "Deployed to AWS EC2/S3/Lambda and Azure App Services, maintaining 99.9% uptime through monitoring with Grafana & Datadog",
    ],
    logo: new URL(`/public/assets/images/freelance.jpg`, import.meta.url).href,
    location: "Hamilton, Canada",
  },
  {
    company: "SOTI Inc.",
    position: "DevOps Engineer Coop – Full Time",
    startDate: "May-2024",
    endDate: "Dec-2024",
    description:
      "Engineered robust CI/CD pipelines and enhanced testing frameworks to streamline deployments.",
    achievements: [
      "Developed end-to-end cloud-based CI/CD pipelines in Jenkins using Groovy scripting, reducing deployment times by 30%",
      "Automated PowerShell-based reindexing scripts for JFrog Xray vulnerability scans, reducing manual effort by 40%",
      "Improved BDD testing frameworks by fixing Angular.js & .NET UI issues, increasing usability and system efficiency",
    ],
    logo: new URL(`/public/assets/images/soti.jpg`, import.meta.url).href,
    location: "Mississauga, Canada",
    website: "https://www.soti.net"
  },
  {
    company: "Soliton Technologies",
    position: "Senior Project Engineer – Full Time",
    startDate: "Jun-2022",
    endDate: "Jul-2023",
    description:
      "Led complex projects while partnering with NI to deliver innovative solutions in cinema robotics and industrial IoT.",
    achievements: [
      "Architected micro-frontends for an Industrial IoT monitoring dashboard using React.js, Typescript, Redux Toolkit, Material UI and D3.js, reducing bundle size by 30% and improving time-to-interactive by 25%",
      "Developed and owned an Agile 3D cinema robotics software project using React.js, Node.js, LabVIEW, C++, Math, and Python technologies; secured long-term engagements worth over 100k USD",
      "Designed and integrated secure MongoDB-backed Node.js REST APIs with OAuth 2.0/JWT authentication and WebSocket streaming, enabling real-time microservices communication, reducing response times by 25%",
      "Standardized React.js code structures across teams, reducing technical debt and optimizing sprint velocity by 15%",
      "Created an internal resource and asset management software using React.js, AJAX, Node.js, PostgreSQL, and SVG/XML, winning second place in a shark-tank contest and securing further funding",
      "Drafted a pull request checklist by standardizing conventional commits and hosting Knowledge Sharing Sessions (KSS), enhancing estimation accuracy and productivity",
      "Engaged in external product discussions to deepen customer insights, converting one-year contracts into long-term engagements",
      "Led Knowledge Sharing Sessions on OPC UA, MQTT, and AWS IoT Core, elevating team skillsets in industrial protocols",
      "Counseled 10 college students for career preparedness as part of a Corporate Social Responsibility initiative, achieving 100% student placement and satisfaction",
      "Received two 'Star Soliton' awards, recognizing exceptional hard work and significant value addition",
    ],
    logo: new URL(`/public/assets/images/soliton.jpg`, import.meta.url).href,
    location: "Bangalore, India",
    website: "https://www.solitontech.com"
  },
  {
    company: "Soliton Technologies",
    position: "Project Engineer – Full Time",
    startDate: "Aug-2020",
    endDate: "Jun-2022",
    description:
      "Developed full-stack solutions that advanced semiconductor validation and boosted overall product quality.",
    achievements: [
      "Built a validation dashboard with React.js, Redux, Electron, and Chart.js, reducing test cycles by 40%",
      "Mentored a machine learning project for anomaly detection in semiconductor data, reducing loss functions by up to 35% and enhancing software performance",
      "Implemented unit testing with Jest and React Testing Library, achieving 100% test coverage and a 30% improvement in application quality",
      "Engineered a high-throughput Big Data PoC using Elastic Stack and AWS ELK, ingesting over 5M+ semiconductor logs/day, enabling anomaly visualization and trend detection",
      "Tailored and led Scrum events for a cinema-robotics project, increasing story point completion by 30% and promoting Agile adoption across teams",
      "Created an industrial IoT edge module using Python FastAPI and Docker to facilitate data transfer via OPC UA and Azure, enabling remote monitoring for 40% of engineers",
      "Researched and developed an IoT proof of concept using NI sensor device drivers to extract high-volume data streams, bolstering confidence in winning industrial projects",
      "Initiated and led career preparedness training for college students under the Corporate Social Responsibility banner, including material development and stakeholder coordination",
      "Coordinated festive company events to foster cross-team connectivity and boost organizational morale",
    ],
    logo: new URL(`/public/assets/images/soliton.jpg`, import.meta.url).href,
    location: "Bangalore, India",
    website: "https://www.solitontech.com"
  },
  {
    company: "Soliton Technologies",
    position: "Project Engineer - Intern",
    startDate: "Jan-2020",
    endDate: "Mar-2020",
    description:
      "Gained foundational skills in LabVIEW and IT services, contributing to real-time application development.",
    achievements: [
      "Trained in LabVIEW and developed real-time applications such as a virtual calculator, flight ticket booking system, and ATM, which exceeded expectations and secured a full-time role.",
    ],
    logo: new URL(`/public/assets/images/soliton.jpg`, import.meta.url).href,
    location: "Bangalore, India",
    website: "https://www.solitontech.com"
  },
  {
    company: "Zoho Corporation",
    position: "Backend Developer - Intern",
    startDate: "May-2019",
    endDate: "Jun-2019",
    description:
      "Contributed to backend development for Zoho Assist, quickly adapting to new technologies and agile workflows.",
    achievements: [
      "Earned recognition for rapid learning and impactful contributions while developing core Java backend modules.",
    ],
    logo: new URL(`/public/assets/images/zoho_corp.jpg`, import.meta.url).href,
    location: "Chennai, India",
    website: "https://www.zoho.com"
  },
];

export const SkillsData: SkillCategory[] = [
  {
    category: "Frontend Development",
    skills: [
      { name: "React.js", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "HTML/CSS", level: 90 },
      { name: "Redux", level: 80 },
    ],
  },
  {
    category: "Backend Development",
    skills: [
      { name: "Node.js", level: 85 },
      { name: "Python", level: 80 },
      { name: "SQL", level: 75 },
      { name: "MongoDB", level: 70 },
    ],
  },
  {
    category: "Tools & Technologies",
    skills: [
      { name: "Git", level: 85 },
      { name: "Docker", level: 75 },
      { name: "AWS", level: 70 },
      { name: "CI/CD", level: 75 },
    ],
  },
];

export const portfolioData: PortfolioData = {
  personal: {
    name: "Harieshwar J A",
    title: "Full Stack Developer",
    bio: "Passionate developer with expertise in React.js, Node.js, and cloud technologies. Currently focused on building scalable web applications and exploring new technologies.",
    photo: new URL(`/public/assets/images/profile-picture.jpg`, import.meta.url).href,
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
      field: "Automation & Smart Systems",
      startDate: "2023",
      endDate: "2025",
      description: "Specializing in automation and software solutions",
      logo: new URL(`/public/assets/images/mcmaster.jpg`, import.meta.url).href,
      location: "Hamilton, ON, Canada",
      gpa: "3.9/4.0",
    },
    {
      institution: "Anna University",
      degree: "Bachelor of Engineering",
      field: "Electrical and Electronics Engineering",
      startDate: "2016",
      endDate: "2020",
      logo: new URL(`/public/assets/images/anna_university.jpg`, import.meta.url).href,
      location: "Thiruvallur, India",
      gpa: "8.57/10.0",
    },
  ],
  skills: SkillsData,
  projects: [
    {
      title: "Portfolio Website SPA 2.0",
      description:
        "A modern, highly optimized personal portfolio built with React 18 and TypeScript. Features include dark/light mode toggle, interactive data visualizations using D3 and Plotly, smooth animations with Framer Motion, and full accessibility compliance. It integrates a robust Redux Toolkit + Saga state management pattern and benefits from automated CI/CD with GitHub Actions and Netlify for instant deployment. Lighthouse scores consistently reach 100 across performance, accessibility, SEO, and best practices.",
      technologies: [
        "HTML5",
        "CSS3",
        "React.js",
        "TypeScript",
        "Redux Toolkit",
        "Redux-Saga",
        "Tailwind CSS",
        "Framer Motion",
        "D3.js",
        "Plotly.js",
        "Vitest",
        "GitHub Actions",
        "Netlify",
      ],
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
      demoLink: "https://your-portfolio-domain.com",
      sourceLink: "https://github.com/HariEshwar-J-A/portfolio",
      featured: true,
    },
    {
      title: "Habit Tracker PWA",
      description:
        "An installable Progressive Web App designed for daily habit tracking with offline support and real-time synchronization. Built using React.js and TypeScript, it leverages Supabase as a backend for authentication and data storage with Row Level Security. Features include service worker caching for offline usage, OAuth-based login with Google and GitHub, dynamic analytics visualized through React-Plotly, and an accessible, responsive UI combining Material-UI and Tailwind CSS. Continuous integration and delivery are automated with GitHub Actions and Netlify.",
      technologies: [
        "HTML5",
        "CSS3",
        "React.js",
        "TypeScript",
        "Supabase",
        "Material-UI",
        "Tailwind CSS",
        "Service Workers",
        "React-Plotly",
        "Vitest",
        "GitHub Actions",
        "Netlify",
      ],
      image: "https://images.pexels.com/photos/374720/pexels-photo-374720.jpeg",
      demoLink: "https://your-habit-tracker-demo.com",
      sourceLink: "https://github.com/HariEshwar-J-A/habit-tracker",
      featured: true,
    },
    {
      title: "Geospatial Earthquake Explorer",
      description:
        "An interactive React-based application designed to explore and visualize earthquake data streamed from the USGS. The app features a split-pane interface where users can interact with scatter plots built with Plotly and linked tabular views. It includes powerful filters such as magnitude sliders and pagination, all styled with Tailwind CSS. Real-time CSV streaming enables dynamic updates, while custom hooks and TypeScript ensure robust, maintainable code. The app is fully responsive and supports dark mode for user comfort.",
      technologies: [
        "HTML5",
        "CSS3",
        "React.js",
        "TypeScript",
        "Plotly.js",
        "Tailwind CSS",
        "Vite",
        "Vitest",
      ],
      image: "https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg",
      demoLink: "https://your-earthquake-explorer-demo.com",
      sourceLink: "https://github.com/HariEshwar-J-A/geologicai-assignment",
      featured: true,
    },
    {
      title: "Gaming Blog App – Ruby on Rails",
      description:
        "A full-stack blogging platform focused on gaming content, developed with Ruby on Rails. It supports user authentication, CRUD operations on blog posts, commenting, and role-based access control. The app features server-side validations, responsive ERB templating for views, and automated tests written in RSpec. Deployment to Heroku ensures easy accessibility, while Git version control maintains efficient development workflows.",
      technologies: [
        "HTML5",
        "CSS3",
        "Ruby",
        "Ruby on Rails",
        "PostgreSQL",
        "RSpec",
        "Render",
        "Bootstrap",
      ],
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/gaming-blog-app",
      featured: false,
    },
    {
      title: "Car Anti-Theft System – Open Source Initiative",
      description:
        "An IoT-based vehicle anti-theft system integrating ultrasonic sensors and AI-based facial recognition for enhanced security. The system captures sensor data in real-time, transmitting it to a JavaScript dashboard for visualization and monitoring. This initiative leverages open source hardware and software components to provide an affordable, extensible security solution. The project combines hardware interfacing, cloud messaging, and front-end data visualization to ensure quick alerts and comprehensive vehicle monitoring.",
      technologies: [
        "JavaScript",
        "HTML5",
        "CSS3",
        "IoT sensors (Ultrasonic)",
        "AI Facial Recognition",
        "WebSocket",
        "React.js",
        "PubNub",
        "AWS",
      ],
      image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/vehicle-anti-theft-system-dashboard",
      featured: false,
    },
    {
      title: "Portfolio Website SPA 1.0 (Legacy)",
      description:
        "The original personal portfolio website built with vanilla JavaScript, CSS, and HTML. It serves as the foundation for the modernized SPA 2.0, showcasing early UI designs and interactive features. The site was built to be lightweight and fully responsive, deployed via GitHub Pages.",
      technologies: [
        "JavaScript",
        "HTML5",
        "CSS3",
        "React.js",
        "Material UI",
        "SPA",
        "GitHub Pages",
        "JSON",
      ],
      image: "https://images.pexels.com/photos/210241/pexels-photo-210241.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/dossier",
      featured: false,
    },
    {
      title: "Word Scramble Game",
      description:
        "A browser-based word scramble game developed entirely in vanilla JavaScript, HTML, and CSS. The game shuffles words for users to unscramble within a time limit, featuring responsive design and interactive animations. Hosted on GitHub Pages, it offers quick playability without any dependencies",
      technologies: ["JavaScript", "HTML5", "CSS3", "GitHub Pages", "SPA", "JSON", "Node.js"],
      image: "https://images.pexels.com/photos/267569/pexels-photo-267569.jpeg",
      sourceLink: "https://github.com/HariEshwar-J-A/scramble.github.io",
      demoLink: "https://word-scramble-game.glitch.me/",
      featured: false,
    },
    {
      title: "Weather Monitoring App",
      description:
        "Real-time weather monitoring application with support for major cities worldwide. Features include current conditions, forecasts, and interactive weather maps.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Node.js", "JSON", "FetchAPI", "Weather API", "GitHub Pages", "SPA"],
      image: "https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg",
      demoLink: "https://harieshwar-j-a.github.io/hari.github.io/",
      sourceLink: "https://github.com/HariEshwar-J-A/hari.github.io",
      featured: false,
    },
    {
      title: "Chat Box App",
      description:
        "Real-time chat application demonstrating WebSocket capabilities. Features include instant messaging, user presence, and message history.",
      technologies: ["HTML5", "CSS3", "JavaScript", "Node.js", "Web Sockets"],
      image: "https://images.pexels.com/photos/4126743/pexels-photo-4126743.jpeg",
      demoLink: "https://chat-box-web.glitch.me/",
      sourceLink: "https://glitch.com/~chat-box-web",
      featured: false,
    },
  ],
  achievements: [
    {
      title: "Star Soliton Award",
      date: "2023",
      description:
        "Received two 'Star Soliton' awards for exceptional hard work and significant value addition to projects",
    },
    {
      title: "Best Alumni (2020 - 2023)",
      date: "2023",
      description:
        "Won Best Alumni from R.M.D Engineering College for training students and faculties in Software Engineering, alongside guiding technical researches",
    },
    {
      title: "Innovation Recognition",
      date: "2022",
      description:
        "Led development of innovative cinema robotics software project, securing long-term engagements worth over 100k USD",
    },
    {
      title: "Shark Tank Runner-up",
      date: "2021",
      description:
        "Second place in internal shark-tank contest for developing resource and asset management software",
    },
    {
      title: "Chess Team - Most Successful Leader/Captain",
      date: "2020",
      description:
        `
        Led RMDEC Boys Chess team in the Zonal Chess tournaments for 3 consecutive years and won top 3 places every year
        | Secured 1st (first) place in board prizes and inter-department chess tournaments in all 4 (four) years, and obtained RMDEC Sports Rolling Trophy for 3 (three) consecutive years",
        | Won multiple Chess tournaments (Rated/Unrated) across India
        | Coached and Developed 4 men Chess team to 50 people (men + women) Chess teams, training multiple students to improve their chess skills and teaching them to advance in their chess career
        | Raised awareness in importance of chess in common people in multiple places within and surrounding campus area (Tiruvallur, Tamil Nadu, India) - reaching out to more than 10,000 people in total
        `,
    },
  ],
  contact: {
    email: "harieshwarja.official@gmail.com",
    location: "Hamilton, ON",
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
