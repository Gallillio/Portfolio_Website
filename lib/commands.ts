import type { CommandResponse } from "./types"
import { skills, experiences, education, freelanceProjects, links, courses } from "./profile-data"
import { commandRegistry } from "./command-registry"
import { projects } from "./projects"
import { getAchievementsData } from "./achievements-context"

// Register all commands
commandRegistry.register("about", "View my background and Bio", async () => ({
  output: [
    "╔══════════════════════════════════════════",
    "║                 About Me                 ",
    "╚══════════════════════════════════════════",
    "",
    "┌─ Bio",
    "│",
    "│  I approach innovation with an AI-first mindset, I firmly believe in using AI tools along side with ",
    "│  Software Engineering to bring advanced technology to life quickly and efficiently.",
    "│",
    "│  Drawing on diverse international experiences in Egypt and Japan, I design and deploy cutting-edge AI",
    "│  Solutions and Software Systems designed to streamline complex processes and deliver substantial value.",
    "│",
    "│  Leveraging robust technologies like Azure, IBM Watsonx, React.js, Next.js, and Cursor.",
    "│",
    "│  My work has consistently delivered transformative results, earning recognition in esteemed International",
    "│  Publications like Elsevier&apos;s Procedia, Awards such as the Times Higher Education Award 2024, ",
    "│  and through my startup, GPTuBE, which was recognized as a Top 3 finalist in the GESAwards Africa, ",
    "│  respresing Egypt, and the entirety of North Africa internationally.",
    "└────────────────────────────────────",
    "",
    "To learn more about my skills, experiences, education, etc... go to about"
  ],
  // specialAction: "switchTab",
  tabName: "about",
  timestamp: new Date(),
}))

commandRegistry.register("projects", "View my projects gallery", async () => {
  const projectsOutput = [
    "╔══════════════════════════════════════════",
    "║               Projects                   ",
    "╚══════════════════════════════════════════",
    ""
  ]

  projects.slice(0, 3).forEach((project) => {
    projectsOutput.push(`┌─ ${project.title}`)
    projectsOutput.push("│")
    project.description.split("\n").forEach((line: string) => {
      projectsOutput.push(`│  ${line.trim()}`)
    })
    projectsOutput.push("│")
    projectsOutput.push(`│  Technologies:`)
    project.technologies.slice(0, 4).forEach((tech: string) => {
      projectsOutput.push(`│    • ${tech}`)
    })
    if (project.technologies.length > 4) {
      projectsOutput.push(`│    • ... and ${project.technologies.length - 4} more`)
    }
    projectsOutput.push("└────────────────────────────────────")
    projectsOutput.push("")
  })

  if (projects.length > 3) {
    projectsOutput.push(`... and ${projects.length - 3} more projects`)
    projectsOutput.push("")
  }

  // End with a line that will be parsed by TerminalOutput component as a clickable link
  projectsOutput.push("To view in more detail, go to projects")

  return {
    output: projectsOutput,
    timestamp: new Date(),
  }
})

commandRegistry.register("contact", "Get my contact information", async () => ({
  output: [
    "╔══════════════════════════════════════════",
    "║             Contact Information          ",
    "╚══════════════════════════════════════════",
    "",
    "┌─ Email",
    "│  <email>AhmedGalal11045@gmail.com</email>",
    "└────────────────────────────────────",
    "",
    "┌─ Phone",
    "│  +20 1110333933",
    "└────────────────────────────────────",
    "",
    "┌─ Location",
    "│  New Cairo, Egypt",
    "└────────────────────────────────────",
    "",
    "Switching to Contact tab..."
  ],
  specialAction: "switchTab",
  tabName: "contact",
  timestamp: new Date(),
}))

commandRegistry.register("my-achievements", "View my achievements and publications", async () => ({
  output: ["Switching to My Achievements tab..."],
  specialAction: "switchTab",
  tabName: "my-achievements",
  timestamp: new Date(),
}))

commandRegistry.register("your-achievements", "View your unlocked achievements", async () => {
  // Access the achievements data
  const achievements = getAchievementsData();
  
  const achievementsOutput = [
    "╔══════════════════════════════════════════",
    "║            Your Achievements             ",
    "╚══════════════════════════════════════════",
    "",
  ];

  // Filter out secret achievements that aren't unlocked
  const filteredAchievements = achievements.filter((achievement) => 
    !achievement.isSecret || (achievement.isSecret && achievement.unlocked)
  );

  // Group achievements by category
  const achievementsByCategory = filteredAchievements.reduce((acc: {[key: string]: typeof achievements}, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  // Display achievements by category
  Object.entries(achievementsByCategory).forEach(([category, value]) => {
    achievementsOutput.push(`┌─ ${category} Achievements`);
    achievementsOutput.push("│");
    
    // Add a type guard to ensure value is an array
    const categoryAchievements = value as typeof achievements;
    
    // Display achievements in this category
    categoryAchievements.forEach((achievement) => {
      const status = achievement.unlocked ? "✓ UNLOCKED" : "✗ LOCKED";
      const statusClass = achievement.unlocked ? "text-green-500" : "text-gray-500";
      
      achievementsOutput.push(`│  • ${achievement.title}: <status class="${statusClass}">${status}</status>`);
    });
    
    achievementsOutput.push("└────────────────────────────────────");
    achievementsOutput.push("");
  });

  achievementsOutput.push("To see your detailed achievement progress, click on your-achievements");

  return {
    output: achievementsOutput,
    timestamp: new Date(),
  };
})

commandRegistry.register("skills", "View my technical skills", async () => {
  const skillsOutput = [
    "╔══════════════════════════════════════════",
    "║            Technical Skills              ",
    "╚══════════════════════════════════════════",
    ""
  ]

  // Get all skill categories
  const categories = Object.entries(skills);
  
  // Display only first 3 categories
  categories.slice(0, 3).forEach(([category, skillList]) => {
    skillsOutput.push(`┌─ ${category}`)
    skillsOutput.push(`│`)
    
    // Display only first 5 skills per category
    skillList.slice(0, 5).forEach(skill => {
      skillsOutput.push(`│  • ${skill}`)
    })
    
    // Show count of additional skills if any
    if (skillList.length > 5) {
      skillsOutput.push(`│  • ... and ${skillList.length - 5} more`)
    }
    
    skillsOutput.push("└────────────────────────────────────")
    skillsOutput.push("")
  })
  
  // Show count of additional categories if any
  if (categories.length > 3) {
    skillsOutput.push(`... and ${categories.length - 3} more categories`)
    skillsOutput.push("")
  }

  // Add link to Skills tab in About section
  skillsOutput.push("To see in more details, go to skills")

  return {
    output: skillsOutput,
    timestamp: new Date(),
  }
})

commandRegistry.register("experience", "View my work experience", async () => {
  const experienceOutput = [
    "╔══════════════════════════════════════════",
    "║             Work Experience              ",
    "╚══════════════════════════════════════════",
    ""
  ]

  // Display only first 2 experiences
  experiences.slice(0, 2).forEach((exp) => {
    experienceOutput.push(`┌─ ${exp.title}`)
    experienceOutput.push(`│  ${exp.company}`)
    experienceOutput.push(`│  Period: ${exp.period}`)
    // Add technologies to the output
    experienceOutput.push(`│  Technologies: ${exp.technologies.join(", ")}`)
    experienceOutput.push("│")
    
    // Display only first 3 lines of description
    const descLines = exp.description.split("\n");
    descLines.slice(0, 3).forEach(line => {
      experienceOutput.push(`│  ${line.trim()}`)
    })
    
    // Show indicator for additional description lines
    if (descLines.length > 3) {
      experienceOutput.push(`│  ...`)
    }
    
    experienceOutput.push("└────────────────────────────────────")
    experienceOutput.push("")
  })
  
  // Show count of additional experiences if any
  if (experiences.length > 2) {
    experienceOutput.push(`... and ${experiences.length - 2} more positions`)
    experienceOutput.push("")
  }

  // Add link to Experience tab in About section
  experienceOutput.push("To see in more details, go to experience")

  return {
    output: experienceOutput,
    timestamp: new Date(),
  }
})

commandRegistry.register("education", "View my educational background", async () => {
  const educationOutput = [
    "╔══════════════════════════════════════════",
    "║               Education                  ",
    "╚══════════════════════════════════════════",
    ""
  ]

  // Display all education entries (usually few)
  education.forEach((edu) => {
    educationOutput.push(`┌─ ${edu.degree}`)
    educationOutput.push(`│  ${edu.institution}`)
    educationOutput.push(`│  Year: ${edu.year}`)
    educationOutput.push(`│  Focus: ${edu.focus}`)
    if (edu.location) {
      educationOutput.push(`│  Location: ${edu.location}`)
    }
    educationOutput.push("└────────────────────────────────────")
    educationOutput.push("")
  })

  // Add link to Education tab in About section
  educationOutput.push("To see in more details, go to education")

  return {
    output: educationOutput,
    timestamp: new Date(),
  }
})

commandRegistry.register("clear", "Clear the terminal", async () => ({
  output: [],
  specialAction: "clear",
  timestamp: new Date(),
}))

commandRegistry.register("links", "View my professional links", async () => ({
  output: [
    "╔══════════════════════════════════════════",
    "║                 Links              ",
    "╚══════════════════════════════════════════",
    "",
    "┌─ GitHub",
    `│  ${links.github}`,
    "└────────────────────────────────────",
    "",
    "┌─ LinkedIn",
    `│  ${links.linkedin}`,
    "└────────────────────────────────────",
    "",
    "┌─ Credly",
    `│  ${links.credly}`,
    "└────────────────────────────────────",
    "",
    '┌─ Note',
    '│  Type "contact" to see more contact options',
    "└────────────────────────────────────",
    ""
  ],
  timestamp: new Date(),
}))

commandRegistry.register("hello", "Secret welcome message", async () => ({
  output: [
    "╔══════════════════════════════════════════",
    "║               Welcome!                   ",
    "╚══════════════════════════════════════════",
    "",
    "┌─",
    "│  Hello there! It's nice to meet you!",
    "│  Thanks for taking the time to explore my portfolio.",
    "│  Feel free to look around and get in touch if you have any questions.",
    "└────────────────────────────────────",
    ""
  ],
  timestamp: new Date(),
}), true, ["hi", "hey", "hii", "heyy", "whats up", "what's up"])

commandRegistry.register("freelance", "View my freelance projects", async () => {
  const freelanceOutput = [
    "╔══════════════════════════════════════════",
    "║            Freelance Projects            ",
    "╚══════════════════════════════════════════",
    ""
  ]

  // Display only first 2 freelance projects
  freelanceProjects.slice(0, 2).forEach((project) => {
    freelanceOutput.push(`┌─ ${project.title}`)
    freelanceOutput.push("│")
    
    // Display first line of description
    const descLines = project.description.split("\n");
    freelanceOutput.push(`│  ${descLines[0].trim()}`)
    
    // Show indicator for additional description lines
    if (descLines.length > 1) {
      freelanceOutput.push(`│  ...`)
    }
    
    freelanceOutput.push("│")
    freelanceOutput.push(`│  Technologies:`)
    
    // Display only first 4 technologies
    project.technologies.slice(0, 4).forEach(tech => {
      freelanceOutput.push(`│    • ${tech}`)
    })
    
    // Show count of additional technologies if any
    if (project.technologies.length > 4) {
      freelanceOutput.push(`│    • ... and ${project.technologies.length - 4} more`)
    }
    
    freelanceOutput.push("└────────────────────────────────────")
    freelanceOutput.push("")
  })
  
  // Show count of additional freelance projects if any
  if (freelanceProjects.length > 2) {
    freelanceOutput.push(`... and ${freelanceProjects.length - 2} more projects`)
    freelanceOutput.push("")
  }

  // Add link to Freelance tab in About section
  freelanceOutput.push("To see in more details, go to freelance")

  return {
    output: freelanceOutput,
    timestamp: new Date(),
  }
})

commandRegistry.register("languages", "View my language proficiencies", async () => ({
  output: [
    "╔══════════════════════════════════════════",
    "║         Language Proficiencies          ",
    "╚══════════════════════════════════════════",
    "",
    "┌─ English",
    "│  Level: Native Language",
    "│  Certification: IELTS 7.5",
    "└────────────────────────────────────",
    "",
    "┌─ Arabic",
    "│  Level: Native Language",
    "└────────────────────────────────────",
    "",
    "┌─ Japanese",
    "│  Level: Conversational",
    "│  Certification: JLPT N4",
    "└────────────────────────────────────",
    ""
  ],
  timestamp: new Date(),
}))

commandRegistry.register("cv", "Download my CV", async () => ({
  output: [
    "Downloading CV...",
    "If download doesn't start automatically, click here:",
    "/Ahmed Elzeky Resume.pdf",
  ],
  timestamp: new Date(),
  specialAction: "downloadCV",
}))

commandRegistry.register("help", "Show available commands", async () => ({
  output: commandRegistry.getHelpText(),
  timestamp: new Date(),
}))

commandRegistry.register("courses", "View my taken courses", async () => {
  const coursesOutput = [
    "╔══════════════════════════════════════════",
    "║                 Courses             ",
    "╚══════════════════════════════════════════",
    ""
  ];

  // Display only first 5 courses
  courses.slice(0, 5).forEach(course => {
    coursesOutput.push(`┌─ ${course.title}`);
    coursesOutput.push(`│  Provider: ${course.provider}`);
    coursesOutput.push(`│  Date: ${course.date}`);
    coursesOutput.push("└────────────────────────────────────");
    coursesOutput.push(""); // Add a blank line for spacing
  });
  
  // Show count of additional courses if any
  if (courses.length > 5) {
    coursesOutput.push(`... and ${courses.length - 5} more courses`);
    coursesOutput.push("");
  }

  // Add link to Courses tab in About section
  coursesOutput.push("To see in more details, go to courses")

  return {
    output: coursesOutput,
    timestamp: new Date(),
  };
})

// Export the available commands for the terminal input component
export const availableCommands = commandRegistry.getAvailableCommands()

// Export the execute command function
export async function executeCommand(input: string): Promise<CommandResponse> {
  return commandRegistry.executeCommand(input)
}

// Special handling for the contact command
export function getContactOutput() {
  return [
    "Email: AhmedGalal11045@gmail.com",
    "Phone: +20 1110333933",
    "Location: New Cairo, Egypt",
    "If you would like to see more, click on Contact / CV",
  ];
}

// Handle contact command directly in terminal.tsx handle command function

export const helpText = `
Available commands (click to add to input):
- help: Show this help message
- courses: Display the courses I've taken
- skills: View my technical skills
- experience: View my work experience
- education: View my educational background
- freelance: View my freelance projects
- projects: View my projects gallery
- contact: Get my contact information
- about: View my background and Bio
- my-achievements: View my achievements and publications
- your-achievements: View your unlocked achievements
- links: View my professional links
- languages: View my language proficiencies
- cv: Download my CV
- clear: Clear the terminal
`;

