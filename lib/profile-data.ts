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
    "LangChain",
    "OpenCV",
    "TensorFlow",
    "Scikit-learn",
    "Keras",
    "Pandas",
    "Numpy",
  ],
  "Cloud & AI Platforms": [
    "Microsoft Azure",
    "Google Cloud",
    "IBM Watsonx",
    "IBM Cloud",
    "Firebase",
  ],
  "Web & Application Development": [
    "JavaScript",
    "TypeScript",
    "ReactJS",
    "NextJS",
    "Node.js",
    "ExpressJS",
    "FastAPI",
    "Django",
    "Flask",
    "Flutter",
    "MongoDB",
    "PostgreSQL",
    "Supabase",
    "REST APIs",
    "OpenAPI",
    "C#",
    "Unity",
    "Tailwind"
  ],
  "DevOps & Tools": [
    "Git",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Cursor",
    "Jupyter Notebook",
    "Vercel",
    "V0",
    "Postman",
    "Linux",
    "Agile/Scrum",
    "Notion",
    "PowerBI",
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
    title: "Software Developer",
    company: "Develop Systems",
    period: "Sep. 2025 - Present",
    technologies: ["Flutter", "Firebase", "API Integration", "Authentication", "Database Design", "Cloud Configuration"],
    description:
      ` • Built and deployed production-ready applications, delivering both Flutter frontends and Firebase backends for client projects.

      • Supported transition of applications into production by handling deployment, debugging, and cloud configuration.

      • Implemented authentication, database design, and API integrations within Firebase to support scalable mobile applications.
      `,
  },
  {
    title: "AI Engineer",
    company: "Intelligent Systems (I-Sys)",
    period: "Feb. 2025 - Present",
    technologies: ["IBM Watsonx", "IBM Cloud", "Docker", "Kubernetes", "Jenkins", "OpenAPI Specification (OAS)", "LLMs", "Data Pipelines", "TTS", "STT", "RAG", "CI/CD"],
    description:
      ` • Built enterprise level AI chat application integrating IBM Watsonx with scalable on-prem and cloud services for secure, explainable, and extensible deployment.

      • Created conversational agents to automate repetitive internal workflows, reducing manual task load, and created document parsing pipelines using RAG.

      • Automated all dockerization of all developed services and its architecture, as well as CI/CD pipelines using Jenkins for on-prem enterprise environment for production use.

      • Trained Egyptian and Saudi dialect-specific TTS/STT models to enable natural language voice commands.

      • Hosted AI workshops and live demos to C-suite executives, helping shape enterprise AI strategy. Workshop Showcase: @https://www.linkedin.com/feed/update/urn:li:activity:7342125077758390273/
      `,
  },
  {
    title: "AI Developer Intern",
    company: "Environ Adapt",
    period: "Aug. 2024 - Oct. 2024",
    technologies: ["TensorFlow", "OpenCV", "Keras", "Deep Neural Networks", "Image Processing", "Data Science"],
    description:
      `• Using Tensorflow and OpenCV to create Siamese Networks that was used in an image recognition model to distinguish between identical trash bales and bales viewed from different angles, automating a previously manual task and significantly reducing company costs in storage and payments by thousands of Egyptian pounds.
      
      • Designed and implemented a validation model to assess image quality against stakeholder-defined requirements, ensuring compliance and improving precision in image verification processes.
      `,
  },
  {
    title: "AI Developer Intern",
    company: "Ecole Supérieure Libre des Sciences Commerciales Appliquées (ESLSCA University)",
    period: "Feb. 2024 - Apr. 2024",
    technologies: ["Microsoft Azure", "Langchain", "OpenAI Function Calling", "Vector Database", "RAG"],
    description: 
    ` • Developed a project, earning ESLSCA University The Times Highest Higher Education Award 2024 in Technological/Digital Innovation at the Arab Summit of Universities, Dubai.
     
    • Used Langchain Framework and OpenAI Function Calling to build a GPT-powered (using Azure OpenAI) chatbot that guides prospective students, provides real-time updates, and automates document processing and verification.
     
    • Streamlined admissions by reducing processing times, enhancing communication, and reallocating staff for personalized support, boosting efficiency.
    
    • Integrated Chroma Vector Database and RAG to provide the chatbot for contextual awareness.`,
  },
  {
    title: "XR Developer",
    company: "GMind",
    period: "Jul. 2023 - Oct. 2023",
    technologies: ["C#", "Unity", "Object-Oriented Programming (OOP)", "Game Development", "Game Design",],
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
  demo_available?: boolean;
  code_available?: boolean;
}

// Add freelance projects data
export const freelanceProjects: FreelanceProject[] = [
  {
    title: '"IIG-HEC" Company Profile Website',
    description: "A website fofeatures a clean and modern design that effectively showcases the company's services, projects, and blog section, providing visitors with a comprehensive overview of IIG-HEC.",
    technologies: ["JavaScript", "ReactJS", "NodeJS", "ExpressJS", "MongoDB", "TailwindCSS", "Firebase", "Vercel"],
    period: "Jun. 2023 - Dec. 2023",
    github: "https://github.com/Gallillio/MERN-IIG_HEC_Company_Website",
    demo: "https://www.iig.land/",
    demo_available: true,
    code_available: true,
  },


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
  icon: "trophy" | "star" | "book" | "languages" | "shieldCheck"  // Using string literals for icon types
  year: string
  category: string
  link?: string  // Optional link to external resource
  linkText?: string
}

// Personal achievements data
export const personalAchievements: PersonalAchievement[] = [
  {
    id: "elsevier-publication",
    title: "Published Journal of Elsevier's Procedia",
    description: `Published "Multi-Hop Arabic LLM Reasoning in Complex QA". 
    Presented in ACLing 2024, the 6th International Conference on AI in Computational Linguistics in Dubai,UAE.`,
    icon: "book",
    year: "Sep. 2024",
    category: "Publication",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050924029806",
    linkText: "View Paper"
  },
  {
    id: "azure-ai-engineer-associate",
    title: "Microsoft Certified: Azure AI Engineer Associate",
    description: `Certified Microsoft Azure AI Engineer.
    Studied for these 3 courses:
    - Microsoft Azure Fundamentals
    - Microsoft Azure AI Fundamentals
    - Designing and Implementing a Microsoft Azure AI Solution`,
    icon: "shieldCheck",
    year: "May. 2025",
    category: "Certification",
    link: "https://learn.microsoft.com/api/credentials/share/en-us/Gallillio/FA9AAA1E4EAF1DC?sharingId=BF374C9707F46C52",
    linkText: "View Certification"
  },
  {
    id: "stakpak-hackathon",
    title: "Winner at the GenAI Hackathon",
    description: `Won the Stakpak Hackathon.
    hosted by Stakpak, for presenting the AI-powered Language Learning App shown under the Projects Section`,
    icon: "star",
    year: "May. 2025",
    category: "Award",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7330556317721432068/",
    linkText: "View LinkedIn Post"
  },

  {
    id: "times-higher-education-eslsca",
    title: "Awarded The Times Highest Higher Education",
    description: `Recognized for innovative contributions in educational technology 
    For my work on My University's Chatbot Project. Awarded in The Arab Summit of Universities in Dubai University`,
    icon: "trophy",
    year: "Dec. 2024",
    category: "Award",
    link: "https://theawardsarabworld.com/2024/en/page/2024",
    linkText: "View Blog Post"
  },
  {
    id: "ges-Awards",
    title: "Awarded Top 3 Finalist in GESAwards Africa",
    description: `My startup GPTube won Top 3 finalist in the GESAwards Africa.
    Representing Egypt and North Africa internationally`,
    icon: "star",
    year: "Dec. 2024",
    category: "Entrepreneurship",
    link: "https://www.linkedin.com/posts/ghana-society-for-education-technology_gesawards2024-edtech-innovation-activity-7265332297669746689-uv6Z?utm",
    linkText: "View LinkedIn Post"
  },
  {
    id: "japanese-proficiency",
    title: "Japanese Language Proficiency",
    description: "Achieved JLPT N4 level in Japanese Language during my studies at Human Academy",
    icon: "languages",
    year: "Jan. 2025",
    category: "Language",
  },
];

// Course interface
export interface Course {
  title: string;
  provider: string;
  date: string;
}

// Courses data
export const courses: Course[] = [
  {
    title: "Designing and Implementing a Microsoft Azure AI Solution",
    provider: "Microsoft",
    date: "Feb. 2025"
  },
  {
    title: "Microsoft Azure AI Fundamentals",
    provider: "Microsoft",
    date: "Feb. 2025"
  },
  {
    title: "Microsoft Azure Fundamentals",
    provider: "Microsoft",
    date: "Feb. 2025"
  },
  {
    title: "Practitioner Watsonx Assistant",
    provider: "IBM",
    date: "Feb. 2025"
  },
  {
    title: "Watsonx Orchestrate Intermediate",
    provider: "IBM",
    date: "Feb. 2025"
  },
  {
    title: "Linux Adminstration",
    provider: "New Horizons",
    date: "Jul. 2023"
  },
  {
    title: "Supervised Machine Learning",
    provider: "DeepLearning.AI",
    date: "Aug. 2022"
  },
  {
    title: "Cloud AWS Practitioner",
    provider: "Amazon",
    date: "Oct. 2022"
  },
  {
    title: "Security +",
    provider: "CompTIA",
    date: "Apr. 2023"
  },
  {
    title: "Network +",
    provider: "CompTIA",
    date: "Aug. 2022"
  },
  {
    title: "CompTIA A+",
    provider: "CompTIA",
    date: "Aug. 2022"
  }
];

