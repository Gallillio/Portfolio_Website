import type { Project } from "./types"

export const projects: Project[] = [
  {
    title: "Real-Time Facial Emotion Classification",
    description:
    "Developed a real-time facial emotion classification system using transfer learning (MobileNetV2, VGG) and a custom CNN, achieving 83% accuracy on FER-2013 dataset using fine-tuned MobileNetV2 model.",
    technologies: ["OpenCV", "CNN", "MobileNetV2", "VGG", "Data Augmentation"],
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
    title: "Data Visualer and Analysis Tool",
    description:
    "A tool to visualize and analyze data. It provides a user-friendly interface for data exploration and model training, with features for data preprocessing.",
    technologies: ["Scikit-learn", "Numpy", "Pandas", "Matplotlib", "Seaborn"],
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
    title: "GPTube",
    description:
      "An interactive tool that engages users with YouTube videos through a GPT-powered chatbot, utilizing TTS and STT for voice interaction. It features generating mock tests, correcting user answers, and creating PowerPoint presentations.",
    technologies: ["Microsoft Azure", "ReactJS", "Django", "Langchain", "Vector Database", "OpenAI Function Calling", "RAG"],
    images: [
      { src: "/placeholder.svg?height=300&width=400", alt: "Placeholder" },
    ],
    github: "https://github.com/Gallillio/GPTube",
    demo: "https://your-gptube-demo.com",
    demo_available: false,
    code_available: true,
  },
  {
    title: "ESLSCA University Chatbot",
    description:
      "A chatbot that streamlines University admissions. Awarded The Times Highest Higher Education Award 2024 for Technological Innovation. It automates document processing and enhances communication with real-time updates. \n\n Note: This project is currently under development from the University and has seen many changes.",
    technologies: ["Microsoft Azure", "Langchain", "OpenAI Function Calling", "Vector Database", "RAG"],
    images: [
      { src: "/ESLSCA Chatbot/example2.png", alt: "ESLSCA Chatbot Example" },
    ],
    github: "https://github.com/your-username/gptube",
    demo: "https://chatbot.eslsca.edu.eg/",
    demo_available: false,
    code_available: false,
  },
  {
    title: "My Portfolio Website",
    description:
    "The website you are currently on! My personal portfolio website showcasing projects, skills, and achievements. Designed as a unique terminal-style website that showcases my skills and projects.",
    technologies: ["ReactJS", "Next.js", "TypeScript", "TailwindCSS"],
    images: [
      { src: "https://i.pinimg.com/originals/12/f6/ac/12f6accc21f3cad0047fc68fc282569c.gif", alt: "Explore the website Right Here!" },
    ],
    github: "https://github.com/Gallillio/Portfolio_Website",
    demo: "https://gallillio.com",
    demo_available: true,
    code_available: true,
  },
];

