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
    company: "Soliton Technologies",
    position: "Software Engineer",
    startDate: "2020",
    endDate: "2023",
    description: "Led development of innovative software solutions for industrial automation and robotics applications. Specialized in real-time control systems and machine vision integration.",
    achievements: [
      "Developed and deployed 5+ major software applications for industrial automation",
      "Reduced system response time by 40% through optimization",
      "Led a team of 3 developers for a critical client project",
      "Implemented CI/CD pipeline reducing deployment time by 60%"
    ],
    logo: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    location: "Coimbatore, India"
  },
  {
    company: "Zoho Corporation",
    position: "Software Development Intern",
    startDate: "2019",
    endDate: "2020",
    description: "Contributed to the development of enterprise software solutions, focusing on backend services and API development.",
    achievements: [
      "Developed RESTful APIs for data analytics platform",
      "Improved database query performance by 30%",
      "Created automated testing suite for core features"
    ],
    logo: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
    location: "Chennai, India"
  }
];

export const SkillsData: SkillCategory[] = [
  {
    category: "Frontend Development",
    skills: [
      { name: "React", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "HTML/CSS", level: 90 },
      { name: "Redux", level: 80 }
    ]
  },
  {
    category: "Backend Development",
    skills: [
      { name: "Node.js", level: 85 },
      { name: "Python", level: 80 },
      { name: "SQL", level: 75 },
      { name: "MongoDB", level: 70 }
    ]
  },
  {
    category: "Tools & Technologies",
    skills: [
      { name: "Git", level: 85 },
      { name: "Docker", level: 75 },
      { name: "AWS", level: 70 },
      { name: "CI/CD", level: 75 }
    ]
  }
];

export const portfolioData: PortfolioData = {
  personal: {
    name: "Harieshwar J A",
    title: "Full Stack Developer",
    bio: "Passionate developer with expertise in React, Node.js, and cloud technologies. Currently focused on building scalable web applications and exploring new technologies.",
    photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    socialLinks: {
      github: "https://github.com/HariEshwar-J-A",
      linkedin: "https://www.linkedin.com/in/harieshwar-j-a/",
      website: "https://harieshwar-j-a.github.io/hari.github.io/"
    }
  },
  experience: WorkData,
  education: [
    {
      institution: "Conestoga College",
      degree: "Graduate Certificate",
      field: "Mobile Solutions Development",
      startDate: "2024",
      endDate: "2025",
      description: "Specializing in mobile and web application development",
      logo: "https://images.pexels.com/photos/5553050/pexels-photo-5553050.jpeg",
      location: "Waterloo, ON",
      gpa: "3.9/4.0"
    },
    {
      institution: "PSG College of Technology",
      degree: "Bachelor of Engineering",
      field: "Electronics and Communication Engineering",
      startDate: "2016",
      endDate: "2020",
      logo: "https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg",
      location: "Coimbatore, India",
      gpa: "8.5/10.0"
    }
  ],
  skills: SkillsData,
  projects: [
    {
      title: "Weather Monitoring App",
      description: "Real-time weather monitoring application with support for major cities worldwide. Features include current conditions, forecasts, and interactive weather maps.",
      technologies: ["HTML5", "CSS3", "JavaScript", "NodeJS", "Weather API"],
      image: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg",
      demoLink: "https://harieshwar-j-a.github.io/hari.github.io/",
      sourceLink: "https://github.com/HariEshwar-J-A/hari.github.io",
      featured: true
    },
    {
      title: "Word Scramble Game",
      description: "Multiplayer word scramble game with real-time competition. Players compete to unscramble words fastest, featuring live scoring and player rankings.",
      technologies: ["HTML5", "CSS3", "JavaScript", "NodeJS", "Web Sockets"],
      image: "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg",
      demoLink: "https://word-scramble-game.glitch.me/",
      sourceLink: "https://glitch.com/~word-scramble-game",
      featured: true
    },
    {
      title: "Chat Box App",
      description: "Real-time chat application demonstrating WebSocket capabilities. Features include instant messaging, user presence, and message history.",
      technologies: ["HTML5", "CSS3", "JavaScript", "NodeJS", "Web Sockets"],
      image: "https://images.pexels.com/photos/1111368/pexels-photo-1111368.jpeg",
      demoLink: "https://chat-box-web.glitch.me/",
      sourceLink: "https://glitch.com/~chat-box-web",
      featured: false
    }
  ],
  achievements: [
    {
      title: "Star Soliton Award",
      date: "2023",
      description: "Received two 'Star Soliton' awards for exceptional hard work and significant value addition to projects."
    },
    {
      title: "Innovation Recognition",
      date: "2022",
      description: "Led development of innovative cinema robotics software project, securing long-term engagements worth over 100k USD."
    },
    {
      title: "Shark Tank Runner-up",
      date: "2021",
      description: "Second place in internal shark-tank contest for developing resource and asset management software."
    }
  ],
  contact: {
    email: "harieshwar.j.a@gmail.com",
    location: "Waterloo, ON",
    emailjsServiceId: "service_id",
    emailjsTemplateId: "template_id",
    emailjsUserId: "user_id"
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
      text: "#F1F5F9"
    },
    light: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A"
    }
  }
};