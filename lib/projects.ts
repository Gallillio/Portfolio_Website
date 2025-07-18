import type { Project } from "./types"

export const projects: Project[] = [
  {
    title: "AI Language Learning App",
    description: "This AI-driven app offers a hyper-personalized language learning experience. Key features include a dynamic Word Bank, adaptive Duolingo-style mini-games, story generation using comprehensible input (90% known, 10% new words), and an FSRS-powered Spaced Repetition flashcard system for superior retention. An AI Chatbot Assistant provides tailored guidance, like a personal tutor.",
    technologies: ["ReactJS", "NextJS", "NodeJS", "Django", "MongoDB", "TailwindCSS", "Vercel"],
    images: [
      { src: "/Language Learning App/reading mode.png", alt: "Reading Tab" },
      { src: "/Language Learning App/story.png", alt: "Story Tab" },
      { src: "/Language Learning App/flashcards.png", alt: "Flashcards Tab" },
      { src: "/Language Learning App/wordbank.png", alt: "Word Bank Tab" },
      { src: "/Language Learning App/add word.png", alt: "Add Word Tab" },
      { src: "/Language Learning App/story add word.png", alt: "Story Add Word Tab" },
    ],
    github: "#", 
    demo: "#",   
    demo_available: false,
    code_available: false, 
    inDevelopment: true,
  },
  {
    title: "GPTube",
    description:
      "An interactive tool that engages users with YouTube videos through a GPT-powered chatbot, utilizing TTS and STT for voice interaction. It features generating mock tests, correcting user answers, and creating PowerPoint presentations.",
    technologies: ["Microsoft Azure", "Google Cloud", "ReactJS", "Django", "Langchain", "Vector Database", "RAG", "OpenAI Function Calling"],
    images: [
      { src: "/GPTube/main.png", alt: "Main Page" },
      { src: "/GPTube/question.png", alt: "Question Example" },
      { src: "/GPTube/quiz.png", alt: "Quiz Example" },
      { src: "/GPTube/powerpoint.png", alt: "Presentation Example" },
    ],
    github: "https://github.com/Gallillio/GPTube",
    demo: "https://gptube-demo.com",
    demo_available: false,
    code_available: true,
  },
  {
    title: "IIG-HEC Company Profile Website",
    description:
    "A website for IIG-HEC Company Profile. With a clean and modern design, it showcases the company's services, projects, and a blog section.",
    technologies: ["JavaScript", "ReactJS", "NodeJS", "ExpressJS", "MongoDB", "TailwindCSS", "Firebase", "Vercel"],
    images: [
      { src: "/IIG-HEC Website/Projects.png", alt: "IIG-HEC Company Profile Website" },
      { src: "/IIG-HEC Website/Contact us.png", alt: "IIG-HEC Company Profile Website" },
      { src: "/IIG-HEC Website/Blog.png", alt: "IIG-HEC Company Profile Website" },
      { src: "/IIG-HEC Website/Main.png", alt: "IIG-HEC Company Profile Website" },
    ],
    github: "https://github.com/Gallillio/MERN-IIG_HEC_Company_Website",
    demo: "https://www.iig.land/",
    demo_available: true,
    code_available: true,
  },
  {
    title: "Data Visualer and Analysis Tool",
    description:
    "An old-school tool to visualize and analyze data. It provides a user-friendly interface for data exploration and model training, with features for data preprocessing.",
    technologies: ["Scikit-learn", "Numpy", "Pandas", "Matplotlib", "Seaborn", "Tkinter"],
    images: [
      { src: "/Data Visualizer Tool/Main.png", alt: "Main" },
      { src: "/Data Visualizer Tool/Histogram EDA.png", alt: "Histogram EDA" },
      { src: "/Data Visualizer Tool/Encode Column.png", alt: "Encode Column" },
      { src: "/Data Visualizer Tool/Detailed EDA.png", alt: "Detailed EDA" },
      { src: "/Data Visualizer Tool/Handle NA.png", alt: "Handle NA" },
    ],
    github: "https://github.com/Gallillio/Data_Science-Data_Visualizer_Tool?tab=readme-ov-file",
    demo: "https://your-portfolio-demo.com",
    demo_available: false,
    code_available: true,
  },
  {
    title: "ESLSCA University Chatbot",
    description:
      "A chatbot that streamlines University admissions. Awarded The Times Highest Higher Education Award 2024 for Technological Innovation. It automates document processing and enhances communication with real-time updates. \n Note: This project is currently under development and has undergone several changes.",
    technologies: ["Microsoft Azure", "Langchain", "Django", "OpenAI Function Calling", "Vector Database", "RAG"],
    images: [
      { src: "/ESLSCA Chatbot/intro-majors.png", alt: "ESLSCA Chatbot Majors Provided Question/Answer" },
      { src: "/ESLSCA Chatbot/courses provided.png", alt: "ESLSCA Chatbot Courses Provided Question/Answer" },
      { src: "/ESLSCA Chatbot/newsletter-thanks.png", alt: "ESLSCA Chatbot Newsletter Subscription / Thanks message" },
    ],
    github: "https://github.com/your-username/gptube",
    demo: "https://chatbot.eslsca.edu.eg/",
    demo_available: true,
    code_available: false,
  },
  {
    title: "Real-Time Facial Emotion Classification",
    description:
    "Developed a real-time facial emotion classification system using transfer learning (MobileNetV2, VGG) and a custom CNN, achieving 83% accuracy on FER-2013 dataset using fine-tuned MobileNetV2 model.",
    technologies: ["OpenCV", "CNN", "MobileNetV2", "VGG", "Flask"],
    images: [
      { src: "/RealTime Facial Emotion Classification Results Slideshow/neutral.png", alt: "Neutral Expression" },
      { src: "/RealTime Facial Emotion Classification Results Slideshow/happy.png", alt: "Happy Expression" },
      { src: "/RealTime Facial Emotion Classification Results Slideshow/fearful.png", alt: "Fearful Expression" },
      { src: "/RealTime Facial Emotion Classification Results Slideshow/sad.png", alt: "Sad Expression" },
      { src: "/RealTime Facial Emotion Classification Results Slideshow/surprised.png", alt: "Surprised Expression" },
    ],
    github: "https://github.com/Gallillio/RealTime_Facial_Emotion_Classification",
    demo: "You think I'm going to host a demo for this one? Hahaha",
    demo_available: false,
    code_available: true,
  },
  {
    title: "My Portfolio Website",
    description:
    "The website you are currently on! My personal portfolio website showcasing projects, skills, and achievements. Designed as a unique terminal-style website that showcases my skills and projects.",
    technologies: ["Google Cloud", "TypeScript", "NextJS", "ReactJS", "TailwindCSS", "Vercel"],
    images: [
      { src: "https://i.pinimg.com/originals/12/f6/ac/12f6accc21f3cad0047fc68fc282569c.gif", alt: "Explore the website Right Here!" },
    ],
    github: "https://github.com/Gallillio/Portfolio_Website",
    demo: "https://gallillio.vercel.app",
    demo_available: true,
    code_available: true,
  },
  {
    title: 'AI Quickbooks CFO Assistant – Swipelabs',
    description: "An AI-powered virtual CFO that automates financial analysis for small businesses. Integrated with QuickBooks API for real-time financial data sync, implemented automated weekly digests via email/Slack, and developed a Financial Health Score algorithm. Built a web dashboard for KPIs and trends, enabled GPT-powered finance Q&A, and created forecast simulation tools with budget tracking and alerting systems.",
    technologies: ["NextJS", "Python", "Supabase", "QuickBooks API", "Postmark"],
    images: [
      { src: "/in-development.png", alt: "Still In Development" },
    ],
    github: "#",
    demo: "#",
    demo_available: false,
    code_available: false,
    inDevelopment: true,
  },
  {
    title: 'Slack AI Assistant – Swipelabs',
    description: "A GPT-powered Slack app for client communication and workflow management. Features real-time interactions with sentiment analysis and AI-suggested replies, client package tracking with automated reminders, and full integration with Trello, ClickUp, and Asana for task management. Includes smart monitoring for unanswered messages, CRM-style reminders for account managers, and automated time tracking with performance reports.",
    technologies: ["Python", "Flask", "Slack API", "Trello API", "ClickUp API", "Google Calendar API", "PostgreSQL", "NLP"],
    images: [
      { src: "/in-development.png", alt: "Still In Development" },
    ],
    github: "#",
    demo: "#",
    demo_available: false,
    code_available: false,
    inDevelopment: true,
  },
  {
    title: '"Brillium" AI SaaS',
    description: "Brillium is an AI-powered LMS that converts PDF textbooks into interactive learning experiences. It generates quizzes, flashcards, and presentations, analyze student performance, and dynamically create questions for improvement. Teachers can monitor and edit content, while a chatbot serves as a personal assistant for students.",
    technologies: ["Google Cloud", "FastAPI","Tesseract OCR", "Python", "ReactJS", "NextJS","NodeJS", "MongoDB", "TailwindCSS", "Vercel"],
    images: [
      { src: "/in-development.png", alt: "Still In Development" },
    ],
    github: "https://github.com/Gallillio/Brillium",
    demo: "https://www.Brillium.com/",
    demo_available: false,
    code_available: false,
    inDevelopment: true,
  },
];

