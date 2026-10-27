// Define types for the skills structure
export type SkillCategory = {
  name: string;
  skills: string[];
};

export type SkillsData = {
  [key: string]: string[];
};

// Main skills data. Groups and leading entries follow the CV; site-only skills sit
// at the end of each group. The terminal `skills` command shows the first 3 groups
// and the first 5 skills of each, so order matters.
export const skills: SkillsData = {
  "AI & LLM": [
    "OpenAI",
    "Anthropic Claude",
    "Google Gemini",
    "IBM watsonx",
    "LangChain",
    "RAG",
    "pgvector",
    "Agentic Tool Use",
    "Prompt Engineering & Tuning",
    "LLM Evaluation",
    "TensorFlow",
    "NLP",
    "Computer Vision",
    "Deep Learning",
    "Machine Learning",
    "OpenCV",
    "Scikit-learn",
    "Keras",
    "Pandas",
    "Numpy",
  ],
  "Programming": [
    "Python",
    "TypeScript",
    "JavaScript",
    "C#",
    "SQL",
  ],
  "Backend & Data": [
    "FastAPI",
    "Django",
    "NestJS",
    "Microservices",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Node.js",
    "ExpressJS",
    "Flask",
    "Firebase",
    "REST APIs",
    "OpenAPI",
  ],
  "Frontend & Mobile": [
    "ReactJS",
    "NextJS",
    "React Native/Expo",
    "Tailwind",
    "Flutter",
  ],
  "Cloud & DevOps": [
    "Microsoft Azure",
    "Google Cloud",
    "IBM Cloud",
    "Docker",
    "Jenkins",
    "Cloudflare Workers",
    "Supabase",
    "Git",
    "Kubernetes",
    "Vercel",
    "Linux",
  ],
  "Tools & Collaboration": [
    "Cursor",
    "V0",
    "Postman",
    "Jupyter Notebook",
    "PowerBI",
    "Agile/Scrum",
    "Notion",
    "Figma",
    "Jira",
    "Trello",
    "Slack",
  ],
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

// Experience data.
// `description` is one line per entry: line 1 is the summary shown before "Learn More"
// (and first in the terminal `experience` preview, which shows 3 lines), then "• " bullets.
// No blank lines: they render as empty bordered paragraphs and waste the terminal preview.
// `period` must stay "Mmm. yyyy - ..." with a plain hyphen: the About timeline sorts on it.
// `location` is read only by the chatbot context.
export const experiences = [
  {
    title: "AI Engineer",
    company: "Intelligent Systems (ISYS), IBM partner",
    period: "Feb. 2025 - Present",
    location: "Smart Village, Egypt",
    technologies: ["IBM watsonx", "Anthropic Claude", "OpenAI", "FastAPI", "NextJS", "Microservices", "pgvector", "RAG", "Multi-tenancy", "SSO (OIDC/SAML)", "SCIM", "Docker", "Jenkins", "TTS", "STT", "IBM Cloud", "OpenAPI Specification (OAS)"],
    description: [
      "Founding engineer on SIA, an enterprise multi-tenant AI assistant: 22 microservices, ~370K lines of code, 11,000+ automated tests.",
      "• Live for about 70 staff and sized for a 1,000-seat client rollout: 22 FastAPI microservices split out of the original monolith, a Next.js front end, per-tenant databases and encryption keys, SSO (OIDC/SAML), SCIM, MFA, and GDPR export and erasure.",
      "• Vendor lock-in removed from the LLM layer: IBM watsonx (Llama 4), Anthropic Claude and OpenAI sit behind one interface with automatic failover. A task-aware router across 20 task types stamps the cost on every call, and measurement on production prompts moved helper tasks to a model 3.5 to 4 times cheaper at the same quality.",
      "• Answer-confidence scoring raised from AUROC 0.35, worse than chance, to a measured 0.994. Chat is grounded in a hybrid pgvector and full-text knowledge base with per-department access control, and answers now cite their source page; none of 1,614 answers carried a citation before.",
      "• 47 department-gated agent tools (email, calendar, Word and Excel authoring, document comparison, web search), and nothing outbound is sent until a person confirms it. Plus an AI recruitment pipeline for CV parsing, candidate matching and deduplication that re-queues automatically after a provider outage.",
      "• Bilingual English/Arabic with full RTL across 6,300+ UI strings, and Arabic-dialect speech in and out (Egyptian and Saudi) through a speech provider behind a swappable port.",
      "• Vodafone's engineering team trained on IBM watsonx.ai over a 9-hour course: prompt engineering, tuning, LoRA/QLoRA, synthetic data, evaluation and RAG.",
      "• C-suite audiences at ISYS conferences: SIA pitched alongside IBM watsonx.ai and watsonx Orchestrate. Workshop showcase: https://www.linkedin.com/feed/update/urn:li:activity:7342125077758390273/",
      "• Every service containerized from one Dockerfile template with hashed lockfiles, and shipped to AWS through the team's Jenkins CI/CD pipeline.",
    ].join("\n"),
  },
  {
    title: "AI Developer Intern",
    company: "Environ Adapt",
    period: "Aug. 2024 - Oct. 2024",
    technologies: ["TensorFlow", "OpenCV", "Keras", "Deep Neural Networks", "Image Processing", "Data Science"],
    description: [
      "Siamese network that replaced manual trash-bale tagging, matching identical bales photographed from different angles.",
      "• Built with TensorFlow and OpenCV; cut storage and payment costs by thousands of Egyptian pounds.",
      "• Image quality-control model validating photos against stakeholder-defined requirements.",
    ].join("\n"),
  },
  {
    title: "AI Developer Intern",
    company: "ESLSCA University",
    period: "Feb. 2024 - Apr. 2024",
    technologies: ["Microsoft Azure", "Langchain", "OpenAI Function Calling", "Vector Database", "RAG"],
    description: [
      "Sole developer of ESLSCA University's GPT-based admissions system, which won Technological/Digital Innovation of the Year at the Times Higher Education Awards Arab World 2024.",
      "• Built on Azure OpenAI with LangChain and OpenAI function calling, grounded in a Chroma vector database through RAG.",
      "• Answers applicants, checks their documents and sends real-time updates, freeing admissions staff for personalized support.",
      "• The award was presented to the university because the system was built during a student internship.",
    ].join("\n"),
  },
  {
    title: "Software Developer Intern",
    company: "IIG-HEC",
    period: "Jun. 2023 - Dec. 2023",
    technologies: ["JavaScript", "ReactJS", "NodeJS", "ExpressJS", "MongoDB", "TailwindCSS", "Firebase", "Vercel"],
    description: [
      "Company website and a real-time blog publishing system on React and Firebase, live at iig.land.",
      "• Blog publishing on Firestore and Firebase Storage.",
    ].join("\n"),
  },
]

// Education data
export const education = [
  {
    degree: "B.Sc. Computer Science",
    institution: "ESLSCA University",
    year: "Sep. 2021 - Sep. 2024",
    focus: "AI & Data Science",
    location: "Cairo, Egypt",
    gpa: "3.5/4.0",
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
  // First line is what the About timeline shows; keep it short.
  description: string;
  technologies: string[];
  period: string;
  // Leave github/demo unset when private: the About card links them with
  // target="_blank", so a "#" placeholder would reopen the portfolio in a new tab.
  github?: string;
  demo?: string;
  demo_available?: boolean;
  code_available?: boolean;
  /** Slug of the same work in lib/projects.ts, so the About page can link to its page. */
  projectSlug?: string;
}

// Add freelance projects data
export const freelanceProjects: FreelanceProject[] = [
  {
    title: "Comic Spot: localized comics storefront",
    projectSlug: "comic-spot",
    description: [
      "Comic Spot, a localized comics storefront at comicspot.co, live in English and Arabic.",
      "Checkout revalidates every variant with Shopify, so stale catalog data cannot authorize a purchase. Cached catalog snapshot with webhook invalidation, a staff inventory pipeline, PKCE customer sessions, and Playwright accessibility and SEO suites across three browsers.",
    ].join("\n"),
    technologies: ["NextJS", "TypeScript", "Cloudflare Workers", "Cloudflare D1", "Cloudflare R2", "Shopify", "Drizzle ORM", "Playwright", "TailwindCSS"],
    period: "Jul. 2026 - Present",
    demo: "https://comicspot.co",
    demo_available: true,
    code_available: false,
  },
  {
    title: "Lango: language-learning app for iOS and Android",
    projectSlug: "lango",
    description: [
      "Lango, a language-learning app for iOS, Android and iPad, in pre-launch.",
      "Learners read stories where about 90% of the words are ones they know and save the rest; a lesson path builds its exercises from their word bank. Offline-first on SQLite with a sync layer to Supabase, seven languages to learn and an Arabic right-to-left UI.",
    ].join("\n"),
    technologies: ["React Native", "Expo", "TypeScript", "Supabase", "SQLite", "Python", "FastAPI", "Google Gemini", "Fly.io"],
    period: "Aug. 2025 - Present",
    demo_available: false,
    code_available: false,
  },
  {
    title: "Swipelabs: AI CFO reporting and Slack assistant",
    projectSlug: "swipelabs-ai-cfo",
    description: [
      "Weekly CFO reports automated over the QuickBooks API.",
      "Revenue, burn rate, overdue invoices and natural-language forecasting, plus a GPT-powered Slack assistant wired to Trello, ClickUp and Google Calendar.",
    ].join("\n"),
    technologies: ["NextJS", "FastAPI", "Python", "Supabase", "QuickBooks API", "Postmark", "Flask", "Slack API", "Trello API", "ClickUp API", "Google Calendar API", "PostgreSQL"],
    period: "Jun. 2025 - Sep. 2025",
    demo_available: false,
    code_available: false,
  },
];

// Add links data
export const links = {
  portfolio: "https://portfolio.gallillio.com",
  github: "https://github.com/Gallillio",
  linkedin: "https://www.linkedin.com/in/ahmed-galal-elzeky-123a4a196",
  credly: "https://www.credly.com/users/ahmed-galal.bbb8ea95",
  tiktok: "https://www.tiktok.com/@gallillio11045",
  orcid: "https://orcid.org/0009-0006-7927-7513",
}

// Personal Achievement interface
export interface PersonalAchievement {
  id: string
  title: string
  // First line is the headline (timeline subtitle); later lines render dimmed.
  description: string
  icon: "trophy" | "star" | "book" | "languages" | "shieldCheck"  // Using string literals for icon types
  // Must be "Mmm. yyyy": the About timeline sorts on it.
  year: string
  category: string
  link?: string  // Optional link to external resource
  linkText?: string
}

// Personal achievements data
export const personalAchievements: PersonalAchievement[] = [
  {
    id: "elsevier-publication",
    title: "Published in Procedia Computer Science (Elsevier)",
    description: [
      "\"Multi-Hop Arabic LLM Reasoning in Complex QA\", Procedia Computer Science 244 (2024) 66–75. Third of five authors: Abdelazim, Begemy, Galal, Sedki, Mohamed.",
      "Presented at ACLing 2024, the 6th International Conference on AI in Computational Linguistics, in Dubai, UAE. Recognized with an ESLSCA research award.",
    ].join("\n"),
    icon: "book",
    year: "Sep. 2024",
    category: "Publication",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050924029806",
    linkText: "View Paper"
  },
  {
    id: "times-higher-education-eslsca",
    title: "Winner, Times Higher Education Awards Arab World 2024",
    description: [
      "Technological/Digital Innovation of the Year, won by the AI admissions system built solo for ESLSCA University.",
      "Presented to the university in Dubai, as the system was built during a student internship. See ESLSCA University Chatbot in the Projects tab.",
    ].join("\n"),
    icon: "trophy",
    year: "Dec. 2024",
    category: "Award",
    link: "https://theawardsarabworld.com/2024/en/page/2024",
    linkText: "View Awards Page"
  },
  {
    id: "stakpak-hackathon",
    title: "Winner, Stakpak GenAI Hackathon",
    description: [
      "Won the GenAI Hackathon hosted by Stakpak with a 48-hour prototype that grew into Lango, now a mobile app.",
      "See Lango in the Projects tab.",
    ].join("\n"),
    icon: "star",
    year: "May. 2025",
    category: "Award",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7330556317721432068/",
    linkText: "View LinkedIn Post"
  },
  {
    id: "ges-Awards",
    title: "Top-3 Finalist, GESAwards Africa 2024",
    description: "Represented Egypt and North Africa with GPTube, a graduation project turning YouTube videos into quizzes and summaries with LangChain and OpenAI.",
    icon: "star",
    year: "Dec. 2024",
    category: "Award",
    link: "https://www.linkedin.com/posts/ghana-society-for-education-technology_gesawards2024-edtech-innovation-activity-7265332297669746689-uv6Z?utm",
    linkText: "View LinkedIn Post"
  },
  {
    id: "azure-ai-engineer-associate",
    title: "Microsoft Certified: Azure AI Engineer Associate",
    description: [
      "Earned May 2025 and since renewed. Credential ID FA9AAA1E4EAF1DC.",
      "Prepared through three Microsoft courses:",
      "- Microsoft Azure Fundamentals",
      "- Microsoft Azure AI Fundamentals",
      "- Designing and Implementing a Microsoft Azure AI Solution",
    ].join("\n"),
    icon: "shieldCheck",
    year: "May. 2025",
    category: "Certification",
    link: "https://learn.microsoft.com/api/credentials/share/en-us/Gallillio/FA9AAA1E4EAF1DC?sharingId=BF374C9707F46C52",
    linkText: "View Certification"
  },
  {
    id: "ibm-watsonx-practitioner-advanced",
    title: "IBM watsonx Practitioner Advanced (3 badges)",
    description: [
      "watsonx.ai (Nov. 2025), watsonx Orchestrate (Nov. 2025) and watsonx Assistant (Mar. 2025), at Practitioner Advanced level.",
      "Plus 21 further IBM badges, all listed on Credly.",
    ].join("\n"),
    icon: "shieldCheck",
    year: "Nov. 2025",
    category: "Certification",
    link: "https://www.credly.com/users/ahmed-galal.bbb8ea95",
    linkText: "View on Credly"
  },
  {
    id: "tech-content-creator",
    title: "Tech Content Creator: 37K Followers",
    description: [
      "37K followers, 484K likes and a 917K-view video on TikTok, building an Arabic-speaking tech audience.",
      "Stats as of Sep. 2026.",
    ].join("\n"),
    icon: "star",
    year: "Sep. 2026",
    category: "Content Creation",
    link: links.tiktok,
    linkText: "View TikTok"
  },
  {
    id: "japanese-proficiency",
    title: "Japanese Language Proficiency",
    description: "JLPT N4 in Japanese, reached during the Human Academy Japanese Language and Business Manner program.",
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
    title: "watsonx Assistant Practitioner",
    provider: "IBM",
    date: "Feb. 2025"
  },
  {
    title: "watsonx Orchestrate Intermediate",
    provider: "IBM",
    date: "Feb. 2025"
  },
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
    title: "Linux Administration",
    provider: "New Horizons",
    date: "Jul. 2023"
  },
  {
    title: "Security+",
    provider: "CompTIA",
    date: "Apr. 2023"
  },
  {
    title: "AWS Cloud Practitioner",
    provider: "Amazon",
    date: "Oct. 2022"
  },
  {
    title: "Supervised Machine Learning",
    provider: "DeepLearning.AI",
    date: "Aug. 2022"
  },
  {
    title: "Network+",
    provider: "CompTIA",
    date: "Aug. 2022"
  },
  {
    title: "CompTIA A+",
    provider: "CompTIA",
    date: "Aug. 2022"
  }
];
