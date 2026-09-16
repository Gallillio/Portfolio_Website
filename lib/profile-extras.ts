// Profile facts that had only ever existed inside the chatbot's hand-written
// PORTFOLIO_CONTEXT string (and, duplicated, inside JSX in components/about.tsx
// and components/contact.tsx). Extracted here so lib/ai/context.ts can generate
// the model's context from structured data instead of a maintained-by-hand blob.

export const bio: string[] = [
  "I architect and deploy enterprise-grade AI solutions that transform how organizations operate. From building secure, on-premises LLM assistants for banks and telecom giants using IBM Watsonx, to developing computer vision systems that save companies thousands in operational costs, my work spans the full spectrum of AI engineering—NLP, computer vision, deep learning, and cloud-native applications.",
  "Leveraging Python, React.js, Microsoft Azure, and IBM Watsonx, I've delivered solutions that earned international recognition—including the Times Higher Education Award 2024 for technological innovation and representing Egypt & North Africa in the GESAwards Global Finals with my startup GPTuBE. My research on Arabic LLM reasoning was published in Elsevier Procedia, and I've led enterprise AI workshops for C-suite executives across leading organizations.",
];

export interface Language {
  name: string;
  level: string;
}

export const languages: Language[] = [
  { name: "English", level: "Native Language (IELTS 7.5)" },
  { name: "Arabic", level: "Native Language" },
  { name: "Japanese", level: "Conversational Level (JLPT N4)" },
];

export const contact = {
  email: "AhmedGalal11045@gmail.com",
  phone: "+20 1110333933",
  location: "New Cairo, Egypt",
} as const;

// Preserved verbatim from PORTFOLIO_CONTEXT: distinguishes courses taken from
// the certifications listed under personalAchievements.
export const coursesNote =
  "Note: These are courses I've taken. For certifications, please visit My Achievements / Publications / Certifications";

// Preserved verbatim from PORTFOLIO_CONTEXT. SYSTEM_INSTRUCTION repeatedly tells
// the model to send users to "the appropriate section of the website", so it
// needs to know what those sections are.
export const siteMap =
  "All sections of the website: 'Terminal', 'Chat Assistant Mode in the Terminal', 'Projects', 'About(with subsections inside it \'skills\', \'Timeline\', \'Professional Experience\', \'Education\', \'Freelance Projects\', \'Languages\', \'Courses\')', 'Contact / CV', 'My Achievements / Publications / Certification', 'Your achievements(the achievements of the user using the website that they collect as they explore the website more)'";
