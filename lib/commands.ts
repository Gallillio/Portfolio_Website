import type { CommandResponse } from "./types"
import { skills, experiences, education, freelanceProjects, links, courses } from "./profile-data"
import { commandRegistry } from "./command-registry"

// Register all commands
commandRegistry.register("about", "View my background and experience", async () => ({
  output: ["Switching to About tab..."],
  specialAction: "switchTab",
  tabName: "about",
  timestamp: new Date(),
}))

commandRegistry.register("projects", "View my projects gallery", async () => ({
  output: ["Switching to Projects tab..."],
  specialAction: "switchTab",
  tabName: "projects",
  timestamp: new Date(),
}))

commandRegistry.register("contact", "Get my contact information", async () => ({
  output: ["Switching to Contact tab..."],
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

commandRegistry.register("your-achievements", "View your unlocked achievements", async () => ({
  output: ["Switching to Your Achievements tab..."],
  specialAction: "switchTab",
  tabName: "your-achievements",
  timestamp: new Date(),
}))

commandRegistry.register("skills", "View my technical skills", async () => {
  const skillsOutput = [
    "╔══════════════════════════════════════════",
    "║            Technical Skills              ",
    "╚══════════════════════════════════════════",
    ""
  ]

  // Loop through each skill category and its skills
  Object.entries(skills).forEach(([category, skillList]) => {
    skillsOutput.push(`┌─ ${category}`)
    skillsOutput.push(`│`)
    
    // Display each skill in the category
    skillList.forEach(skill => {
      skillsOutput.push(`│  • ${skill}`)
    })
    
    skillsOutput.push("└────────────────────────────────────")
    skillsOutput.push("")
  })

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

  experiences.forEach((exp) => {
    experienceOutput.push(`┌─ ${exp.title}`)
    experienceOutput.push(`│  ${exp.company}`)
    experienceOutput.push(`│  Period: ${exp.period}`)
    experienceOutput.push("│")
    exp.description.split("\n").forEach(line => {
      experienceOutput.push(`│  ${line.trim()}`)
    })
    experienceOutput.push("└────────────────────────────────────")
    experienceOutput.push("")
  })

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

  freelanceProjects.forEach((project) => {
    freelanceOutput.push(`┌─ ${project.title}`)
    freelanceOutput.push("│")
    project.description.split("\n").forEach(line => {
      freelanceOutput.push(`│  ${line.trim()}`)
    })
    freelanceOutput.push("│")
    freelanceOutput.push(`│  Technologies:`)
    project.technologies.forEach(tech => {
      freelanceOutput.push(`│    • ${tech}`)
    })
    if (project.github) {
      freelanceOutput.push(`│  GitHub: ${project.github}`)
    }
    if (project.demo) {
      freelanceOutput.push(`│  Demo: ${project.demo}`)
    }
    freelanceOutput.push("└────────────────────────────────────")
    freelanceOutput.push("")
  })

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
    "",
    "Type 'about' to view my professional profile or navigate to the 'Languages' tab for more details."
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

  // Add each course to the output
  courses.forEach(course => {
    coursesOutput.push(`┌─ ${course.title}`);
    coursesOutput.push(`│  Provider: ${course.provider}`);
    coursesOutput.push(`│  Date: ${course.date}`);
    coursesOutput.push("└────────────────────────────────────");
    coursesOutput.push(""); // Add a blank line for spacing
  });

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

export const helpText = `
Available commands:
- help: Show this help message
- courses: Display the courses I've taken
// ... other commands ...
`;

