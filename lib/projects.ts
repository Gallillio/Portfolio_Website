import type { Project } from "./types"

// Order is deliberate: strongest and newest first. The terminal `projects` command
// previews the first 3, and the AI context presents them in this order.
export const projects: Project[] = [
  {
    title: "Comic Spot",
    period: "Jul. 2026 - Present",
    description: "Comic Spot, a live bilingual English/Arabic comics storefront at comicspot.co. Checkout revalidates every variant with Shopify, so stale catalogue data cannot authorise a purchase. Built on Next.js and Cloudflare Workers with headless Shopify, D1 and R2: cached catalogue snapshot with webhook invalidation, a staff inventory pipeline, PKCE customer sessions, and Playwright accessibility and SEO suites across three browsers.",
    technologies: ["NextJS", "TypeScript", "Cloudflare Workers", "Cloudflare D1", "Cloudflare R2", "Shopify", "Drizzle ORM", "Playwright", "TailwindCSS"],
    images: [
      { src: "/Comic Spot/home.png", alt: "Comic Spot home page in English" },
      { src: "/Comic Spot/home-arabic.png", alt: "Comic Spot home page in Arabic, right to left" },
      { src: "/Comic Spot/product.png", alt: "Comic Spot product page" },
      { src: "/Comic Spot/storylines.png", alt: "Comic Spot reading orders page" },
    ],
    github: "#",
    demo: "https://comicspot.co",
    demo_available: true,
    code_available: false,
  },
  {
    title: "Lango",
    period: "2025 - Present",
    description: "Language-learning app built on comprehensible input: stories generated at 90% known / 10% new vocabulary, with that ratio validated after generation instead of trusting the model. A self-hosted Python NLP service on Fly.io handles Japanese (spaCy + SudachiPy), Chinese and Korean grapheme-to-phoneme. The React Native/Expo app is offline-first on SQLite with a sync layer, backed by Supabase. Grew from the prototype that won the Stakpak GenAI Hackathon.",
    technologies: ["React Native", "Expo", "TypeScript", "Supabase", "SQLite", "Python", "spaCy", "SudachiPy", "Fly.io"],
    // Web-prototype screenshots until app screenshots land in public/Lango/.
    images: [
      { src: "/Language Learning App/reading mode.png", alt: "Web prototype: reading tab" },
      { src: "/Language Learning App/story.png", alt: "Web prototype: story tab" },
      { src: "/Language Learning App/flashcards.png", alt: "Web prototype: flashcards tab" },
      { src: "/Language Learning App/wordbank.png", alt: "Web prototype: word bank tab" },
      { src: "/Language Learning App/add word.png", alt: "Web prototype: add word tab" },
      { src: "/Language Learning App/story add word.png", alt: "Web prototype: adding a word from a story" },
    ],
    github: "#",
    demo: "#",
    demo_available: false,
    code_available: false,
    inDevelopment: true,
  },
  {
    title: "Swipelabs AI CFO and Slack Assistant",
    period: "Jun. 2025 - Sep. 2025",
    description: "Weekly CFO reporting automated over the QuickBooks API: revenue, burn rate, overdue invoices and natural-language forecasting, delivered by email and Slack. Includes a Financial Health Score weighted by business type, a KPI dashboard with a 'what changed this week' summary, and forecast and budget simulations with overspend alerts. A companion GPT-powered Slack assistant, wired to Trello, ClickUp and Google Calendar, tracks client packages, flags unanswered messages and sends CRM-style follow-up reminders.",
    detailedDescription: "An AI virtual CFO and a Slack assistant built for Swipelabs. The CFO tool syncs invoices, accounts receivable, expenses and cash flow from the QuickBooks API and sends automated weekly digests by email and Slack covering revenue trends, burn rate, overdue invoices and AI insights. A Financial Health Score uses business-type-adjusted weights (burn multiple, margin, runway). Founders can ask finance questions by email and get GPT-powered replies within minutes. A read-only web dashboard shows financial KPIs, trends and a diff-style 'What changed this week?' summary, with forecast simulation, text-based scenario analysis, budget tracking and overspend alerts. The companion GPT-powered Slack app works across direct messages, internal channels and Slack Connect, with real-time pings, sentiment cues and AI-suggested replies. It tracks client packages and onboarding with automatic reminders, integrates with Trello, ClickUp and Google Calendar to compare deliverables against obligations and ping owners of overdue tasks, monitors Slack Connect for unanswered messages, deadlines and client tone, sends CRM-style follow-up nudges to account managers, and produces weekly or on-demand performance reports from time tracking.",
    technologies: ["NextJS", "FastAPI", "Python", "Supabase", "QuickBooks API", "Postmark", "Flask", "Slack API", "Trello API", "ClickUp API", "Google Calendar API", "PostgreSQL", "NLP"],
    images: [
      { src: "/Mini CFO/dashboard 1.png", alt: "Main Dashboard Overview" },
      { src: "/Mini CFO/dashboard 2.png", alt: "Financial KPIs Dashboard" },
      { src: "/Mini CFO/dashboard 3.png", alt: "Analytics Dashboard" },
      { src: "/Mini CFO/AI Assistant in Dashboard.png", alt: "AI Assistant Integration" },
      { src: "/Mini CFO/Balance Sheet.png", alt: "Balance Sheet View" },
      { src: "/Mini CFO/Forecasting.png", alt: "Financial Forecasting Tool" },
      { src: "/Mini CFO/invoices.png", alt: "Invoice Management" },
      { src: "/Mini CFO/transactions.png", alt: "Transaction Overview" },
    ],
    github: "#",
    demo: "#",
    demo_available: false,
    code_available: false,
  },
  {
    title: "GPTube",
    period: "2024",
    description:
      "Graduation project and top-3 finalist at GESAwards Africa 2024: turns YouTube videos into quizzes, summaries and slides. A GPT-powered chatbot answers questions about the video by voice (TTS/STT), generates mock tests, marks answers and builds PowerPoint decks.",
    technologies: ["Microsoft Azure", "Google Cloud", "ReactJS", "Django", "Langchain", "Chroma DB", "RAG", "OpenAI Function Calling"],
    images: [
      { src: "/GPTube/main.png", alt: "Main Page" },
      { src: "/GPTube/question.png", alt: "Question Example" },
      { src: "/GPTube/quiz.png", alt: "Quiz Example" },
      { src: "/GPTube/powerpoint.png", alt: "Presentation Example" },
    ],
    github: "https://github.com/Gallillio/GPTube",
    demo: "#",
    demo_available: false,
    code_available: true,
  },
  {
    title: "ESLSCA University Chatbot",
    period: "Feb. 2024 - Apr. 2024",
    description:
      "Admissions chatbot for ESLSCA University, part of the AI system that won Technological/Digital Innovation of the Year at the Times Higher Education Awards Arab World 2024. Guides prospective students, sends real-time updates and automates document processing and verification.",
    technologies: ["Microsoft Azure", "Langchain", "Django", "OpenAI Function Calling", "Vector Database", "RAG"],
    images: [
      { src: "/ESLSCA Chatbot/intro-majors.png", alt: "ESLSCA Chatbot Majors Provided Question/Answer" },
      { src: "/ESLSCA Chatbot/courses provided.png", alt: "ESLSCA Chatbot Courses Provided Question/Answer" },
      { src: "/ESLSCA Chatbot/newsletter-thanks.png", alt: "ESLSCA Chatbot Newsletter Subscription / Thanks message" },
    ],
    github: "#",
    // The hosted demo currently fails its TLS handshake (HTTP 525); flip back when it recovers.
    demo: "https://chatbot.eslsca.edu.eg/",
    demo_available: false,
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
    title: "IIG-HEC Company Profile Website",
    period: "Jun. 2023 - Dec. 2023",
    description:
    "Company website for IIG-HEC, built during a software development internship: services, projects and a real-time blog. Live at iig.land.",
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
    title: "Data Visualiser and Analysis Tool",
    description:
    "Desktop tool for exploratory data analysis and preprocessing ahead of supervised machine learning: load a CSV, visualise distributions, handle missing values, encode columns and train models from a Tkinter interface.",
    technologies: ["Scikit-learn", "Numpy", "Pandas", "Matplotlib", "Seaborn", "Tkinter"],
    images: [
      { src: "/Data Visualizer Tool/Main.png", alt: "Main" },
      { src: "/Data Visualizer Tool/Histogram EDA.png", alt: "Histogram EDA" },
      { src: "/Data Visualizer Tool/Encode Column.png", alt: "Encode Column" },
      { src: "/Data Visualizer Tool/Detailed EDA.png", alt: "Detailed EDA" },
      { src: "/Data Visualizer Tool/Handle NA.png", alt: "Handle NA" },
    ],
    github: "https://github.com/Gallillio/Data_Science-Data_Visualizer_Tool?tab=readme-ov-file",
    demo: "#",
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
    demo: "https://portfolio.gallillio.com",
    demo_available: true,
    code_available: true,
  },
];
