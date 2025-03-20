import type { Project } from "./types"

export const projects: Project[] = [
  {
    title: "GPTube",
    description:
      "An interactive tool that engages users with YouTube videos through a GPT-powered chatbot, utilizing TTS and STT for voice interaction. It features generating mock tests, correcting user answers, and creating PowerPoint presentations.",
    technologies: ["Microsoft Azure", "React.js", "Django", "Langchain", "Vector Database", "OpenAI Function Calling"],
    image: "/placeholder.svg?height=300&width=400",
    github: "https://github.com/your-username/gptube",
    demo: "https://your-gptube-demo.com",
    demo_available: false,
  },
  {
    title: "Real-Time Facial Emotion Classification",
    description:
      "Developed a real-time facial emotion classification system using transfer learning (MobileNetV2, ResNet50, VGG) and a custom CNN, achieving 83% accuracy on FER-2013 dataset using fine-tuned MobileNetV2 model.",
    technologies: ["OpenCV", "CNN", "MobileNetV2", "VGG", "ResNet50", "Data Augmentation"],
    image: "/placeholder.svg?height=300&width=400",
    github: "https://github.com/Gallillio/Realtime_Face_Emotion_Recognition",
    demo: "https://your-emotion-classification-demo.com",
    demo_available: false,
  },
  {
    title: "My Portfolio Website",
    description:
      "The website you are currently on! My personal portfolio website showcasing projects, skills, and achievements. Designed as a unique terminal-style website that showcases my skills and projects. ",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    image: "/placeholder.svg?height=300&width=400",
    github: "https://github.com/Gallillio/Portfolio_Website",
    demo: "https://your-portfolio-demo.com",
    demo_available: true,
  },
  {
    title: "AI Chatbot Assistant",
    description:
      "A conversational AI assistant built with advanced NLP techniques to provide helpful responses to user queries.",
    technologies: ["Python", "TensorFlow", "NLP", "Flask"],
    image: "/placeholder.svg?height=300&width=400",
    github: "https://github.com/",
    demo: "https://demo.example.com/ai-chatbot",
    demo_available: false,
  },
  {
    title: "AI Chatbot Assistant",
    description:
      "A conversational AI assistant built with advanced NLP techniques to provide helpful responses to user queries.",
    technologies: ["Python", "TensorFlow", "NLP", "Flask"],
    image: "/placeholder.svg?height=300&width=400",
    github: "https://github.com/",
    demo: "https://demo.example.com/ai-chatbot",
    demo_available: false,
  },
]

