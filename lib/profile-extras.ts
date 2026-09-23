// Profile facts shared by the About tab, the terminal commands, the Contact tab
// and the chatbot context (lib/ai/context.ts). Keep them here and only here:
// copies that lived in JSX and in lib/commands.ts drifted from each other and
// made the chatbot contradict the page.

// Short role title for the welcome banner, the About profile card and metadata.
export const title = "AI Engineer";

// Matches the CV header line.
export const headline = "AI Engineer | LLMs | RAG | Agentic Systems | Arabic NLP";

// First person on purpose: this is the conversational About bio. The first
// paragraph is the one visible before "Read More".
export const bio: string[] = [
  "Enterprise generative AI, built end to end. At ISYS, an IBM partner, I build SIA: a multi-tenant AI assistant on 22 microservices, live for about 70 staff and sized for a 1,000-seat client rollout.",
  "The results I measure: answer-confidence scoring raised from AUROC 0.35 to 0.994, answers that cite their source page where none of 1,614 did before, and IBM watsonx, Claude and OpenAI behind one interface with automatic failover. I also trained Vodafone's engineering team on IBM watsonx.ai and pitch SIA to C-suite audiences.",
  "Beyond ISYS: freelance builds such as comicstop.co and Lango, co-authored Arabic LLM reasoning research published by Elsevier, and Arabic tech videos for 37K followers.",
];

export interface Language {
  name: string;
  level: string;
  certification?: string;
}

// Order follows the CV.
export const languages: Language[] = [
  { name: "English", level: "Fluent", certification: "IELTS 7.5" },
  { name: "German", level: "A1, currently learning" },
  { name: "Japanese", level: "Conversational", certification: "JLPT N4" },
  { name: "Arabic", level: "Native" },
];

export const contact = {
  email: "ahmedgalal11045@gmail.com",
  phone: "+20 111 033 3933",
  phoneHref: "tel:+201110333933",
  location: "Cairo, Egypt",
} as const;

// The URL keeps its old name so links already shared keep working; `downloadName`
// is what the visitor's browser saves it as. terminal-output.tsx matches `path`
// exactly to turn the `cv` command's output line into a download link.
export const cv = {
  path: "/Ahmed Elzeky Resume.pdf",
  downloadName: "Ahmed_Galal_Elzeky_AI_Engineer_CV.pdf",
} as const;

// From the CV header. Only the chatbot context reads it.
export const workEligibility = "Egyptian national; military service: exempted";

export interface Highlight {
  title: string;
  period: string;
  // Where the facts live. No numbers here on purpose: they belong to the
  // experience and project entries, so the ranking cannot drift from them.
  pointer: string;
}

// Ahmed's own ranking, used by the chatbot for "most impressive" and "recent" questions.
export const highlights: Highlight[] = [
  {
    title: "SIA at Intelligent Systems (ISYS)",
    period: "Feb. 2025 - Present",
    pointer: "His main work and largest system; details under the AI Engineer role in Professional Experience.",
  },
  {
    title: "Comic Stop",
    period: "Jul. 2026 - Present",
    pointer: "His most recent build, live at comicstop.co; details under Projects.",
  },
  {
    title: "Lango",
    period: "2025 - Present",
    pointer: "His own product, grown from the prototype that won the Stakpak GenAI Hackathon; details under Projects.",
  },
  {
    title: "IBM watsonx.ai training for Vodafone",
    period: "during the ISYS role",
    pointer: "Client enablement delivered to Vodafone's engineering team; details under the AI Engineer role.",
  },
  {
    title: "Elsevier publication on multi-hop Arabic LLM reasoning",
    period: "Sep. 2024",
    pointer: "Peer-reviewed research; details under Achievements, Publications and Certifications.",
  },
];

// Preserved verbatim from PORTFOLIO_CONTEXT: distinguishes courses taken from
// the certifications listed under personalAchievements.
export const coursesNote =
  "Note: These are courses I've taken. For certifications, please visit My Achievements / Publications / Certifications";

// Preserved verbatim from PORTFOLIO_CONTEXT. SYSTEM_INSTRUCTION repeatedly tells
// the model to send users to "the appropriate section of the website", so it
// needs to know what those sections are.
export const siteMap =
  "All sections of the website: 'Terminal', 'Chat Assistant Mode in the Terminal', 'Projects', 'About(with subsections inside it \'skills\', \'Timeline\', \'Professional Experience\', \'Education\', \'Freelance Projects\', \'Languages\', \'Courses\')', 'Contact / CV', 'My Achievements / Publications / Certification', 'Your achievements(the achievements of the user using the website that they collect as they explore the website more)'";
