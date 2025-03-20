// Define types for the skills structure
export type SkillCategory = {
  name: string;
  skills: string[];
};

export type SkillsData = {
  [key: string]: string[];
};

// Main skills data
export const skills: SkillsData = {
  "AI & Machine Learning": [
    "NLP",
    "Computer Vision",
    "Deep Learning",
    "Machine Learning",
    "TensorFlow",
    "OpenCV",
    "LangChain",
    "PowerBI"
  ],
  "Cloud & AI Platforms": [
    "Microsoft Azure",
    "IBM Watsonx",
    "IBM Cloud"
  ],
  "Web & Application Development": [
    "Python",
    "JavaScript/TypeScript",
    "ReactJS",
    "NextJS",
    "Node.js",
    "ExpressJS",
    "FastAPI",
    "Django",
    "Flask",
    "MongoDB",
    "REST APIs",
    "OpenAPI",
    "C#",
    "Unity",
    "XR Development",
    "TailwindCSS"
  ],
  "DevOps & Tools": [
    "Git",
    "Docker",
    "Postman",
    "Vercel",
    "V0",
    "Linux",
    "Agile/Scrum"
  ],
  "Design & Collaboration": [
    "Figma",
    "Jira",
    "Trello",
    "Slack"
  ]
};

// Helper function to get skills as an array of categories
export const getSkillsAsCategories = (): SkillCategory[] => {
  return Object.entries(skills).map(([name, skills]) => ({
    name,
    skills
  }));
};

// Helper function to get all skills as a flat array
export const getAllSkills = (): string[] => {
  return Object.values(skills).flat();
};

// Experience data
export const experiences = [
  {
    title: "AI Engineer",
    company: "Intelligent Systems (I-Sys)",
    period: "Feb. 2025 - Present",
    description:
      ` • Collaborated the deployment of Watsonx-powered self-service robots, kiosk avatars, and omni-channel conversational AI systems that enhance customer engagement across our partner Telecommunication and banking companies Vodaphone and Bank Misr
      
      • Developed custom NLP modules within Watsonx.ai to support multilingual interactions in Arabic's regional dialects (Egyptian and Saudi) with high accuracy—to ensure a seamless customer experience. 
      
      • Leveraged IBM Watsonx to power event robots that enabling features like automated registration (with ID QR code scanning and instant photo printing, interactive demonstrations, and real-time feedback collection.
      `,
  },
  {
    title: "AI Developer Intern",
    company: "Environ Adapt",
    period: "Aug. 2024 - Oct. 2024",
    description:
      `• Using Tensorflow and OpenCV to create Siamese Networks that was used in an image recognition model to distinguish between identical trash bales and bales viewed from different angles, automating a previously manual task and significantly reducing company costs in storage and payments by thousands of Egyptian pounds.
      
      • Designed and implemented a validation model to assess image quality against stakeholder-defined requirements, ensuring compliance and improving precision in image verification processes.
      `,
  },
  {
    title: "AI Developer Intern",
    company: "Ecole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)",
    period: "Feb. 2024 - Apr. 2024",
    description: 
    ` • Developed a project, earning ESLSCA University The Times Highest Higher Education Award 2024 in Technological/Digital Innovation at the Arab Summit of Universities, Dubai.
     
    • Used Langchain Framework and OpenAI Function Calling to build a GPT-powered chatbot that guides prospective students, provides real-time updates, and automates document processing and verification.
     
    • Streamlined admissions by reducing processing times, enhancing communication, and reallocating staff for personalized support, boosting efficiency.
    
    • Integrated Chroma Vector Database and RAG to provide the chatbot for contextual awareness.`,
  },
  {
    title: "XR Developer",
    company: "GMind",
    period: "Jul. 2023 - Oct. 2023",
    description: 
    `  • Used C# to implementing player mechanics and complex AI behavior of NPCs and player interactions.
    
    • Gained a clear understanding of Object-Oriented Programming
    
    • Refine tasks to help to achieve the vision of the game designer.`,
  },
]

// Education data
export const education = [
  {
    degree: "B.S. in Computer Science",
    institution: "Ecole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)",
    year: "Sep. 2021 - Sep. 2024",
    focus: "AI & Data Science",
    location: "Egypt",
  },
  {
    degree: "Japanese Language and Business Manner",
    institution: "Human Academy",
    year: "Oct. 2024 - Jan. 2025",
    focus: "Reached N4 Japanese Language Level",
    location: "Japan (Remote)",
  },
]

// Add interface for freelance projects
export interface FreelanceProject {
  title: string;
  description: string;
  technologies: string[];
  period: string;
  github?: string;
  demo?: string;
}

// Add freelance projects data
export const freelanceProjects: FreelanceProject[] = [
  {
    title: "IIG-HEC Company Profile Website",
    description: "A website for IIG-HEC Company Profile. With a clean and modern design, it showcases the company's services, projects, and a blog section.",
    technologies: ["JavaScript", "ReactJS", "NodeJS", "ExpressJS", "MongoDB", "TailwindCSS", "Firebase", "Vercel"],
    period: "Jun. 2023 - Dec. 2023",
    github: "https://github.com/Gallillio/MERN-IIG_HEC_Company_Website",
    demo: "https://www.iig.land/"
  },
  // {
  //   title: "AAAAAA",
  //   description: "AI-powered YouTube video summarizer and Q&A platform. Achieved Top 3 finalist position in GESAwards Africa.",
  //   technologies: ["Next.js", "OpenAI", "TypeScript", "TailwindCSS"],
  //   period: "Nov. 2024",
  //   github: "https://github.com/yourusername/gptube",
  //   demo: "https://gptube.ai"
  // },
];

// Add links data
export const links = {
  github: "https://github.com/Gallillio",
  linkedin: "https://www.linkedin.com/in/ahmed-galal-123a4a196",
  credly: "https://www.credly.com/users/ahmed-galal.bbb8ea95"
}

// Personal Achievement interface
export interface PersonalAchievement {
  id: string
  title: string
  description: string
  icon: "trophy" | "star" | "book" | "languages"  // Using string literals for icon types
  year: string
  category: string
}

// Personal achievements data
export const personalAchievements: PersonalAchievement[] = [
  {
    id: "japanese-proficiency",
    title: "Japanese Language Proficiency",
    description: "Achieved JLPT N4 level in Japanese Language during my studies at Human Academy",
    icon: "languages",
    year: "Jan. 2025",
    category: "Language",
  },
  {
    id: "ges-Awards",
    title: "Startup GESAwards",
    description: `My startup GPTube won Top 3 finalist in the GESAwards Africa.
    Representing Egypt and North Africa internationally`,
    icon: "star",
    year: "Dec. 2024",
    category: "Entrepreneurship",
  },
  {
    id: "times-higher-education-eslsca",
    title: "Awarded The Times Highest Higher Education",
    description: "Recognized for innovative contributions in educational technology in The Arab Summit of Universities in Dubai University",
    icon: "trophy",
    year: "Dec. 2024",
    category: "Award",
  },
  {
    id: "elsevier-publication",
    title: "Published Journal of Elsevier's Procedia",
    description: `Published "Multi-Hop Arabic LLM Reasoning in Complex QA". 
    Presented in ACLing 2024, the 6th International Conference on AI in Computational Linguistics in Dubai,UAE.`,
    icon: "book",
    year: "Sep. 2024",
    category: "Publication",
  },
];

