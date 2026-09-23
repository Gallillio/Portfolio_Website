// Generates the factual context the model is given, from the SAME structured data
// that renders the About / Projects / Contact tabs.
//
// This replaces the 457-line hand-maintained PORTFOLIO_CONTEXT literal in
// lib/portfolio-context.ts. That literal encoded the same facts a second time in
// an incompatible shape, so the two could drift and make the chatbot contradict
// the page the visitor is looking at.

import {
  getSkillsAsCategories,
  experiences,
  education,
  freelanceProjects,
  links,
  personalAchievements,
  courses,
} from "@/lib/profile-data";
import { projects } from "@/lib/projects";
import {
  headline,
  bio,
  highlights,
  languages,
  contact,
  workEligibility,
  coursesNote,
  siteMap,
} from "@/lib/profile-extras";

/**
 * Descriptions in profile-data.ts are indented template literals carrying bullet
 * characters, ragged whitespace and (in one case) a stray "@" glued to a URL.
 * Feeding that to the model wastes tokens and teaches it a malformed link.
 */
function normalizeText(raw: string): string {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/@(?=https?:\/\/)/g, ""))
    .join("\n");
}

/** projects.ts uses "#" as the sentinel for "no link" — never show that to the model. */
function linkLine(label: string, url: string | undefined, available: boolean | undefined): string {
  const usable = available !== false && url && url !== "#";
  return `${label}: ${usable ? url : "not available"}`;
}

function section(heading: string, body: string): string {
  return `## ${heading}\n${body}`;
}

export function buildPortfolioContext(): string {
  const parts: string[] = [];

  parts.push(
    section(
      "Bio",
      [`Ahmed Galal Elzeky (nickname: Gallillio). ${headline}.`, "In his own words:", ...bio].join("\n")
    )
  );

  // The ranking is Ahmed's, not the model's. Without it, "most impressive" and "what has he
  // built recently" were answered from arbitrary array order. Pointers only: the facts live
  // in the sections below, so the ranking cannot drift from them.
  parts.push(
    section(
      "Highlights",
      [
        "Ranked by Ahmed. Use this order for his most impressive work, and the periods for recent work. SIA is his main project even though it is listed under Professional Experience, not Projects.",
        ...highlights.map((h, i) => `${i + 1}. ${h.title} (${h.period}): ${h.pointer}`),
      ].join("\n")
    )
  );

  parts.push(
    section(
      "Skills",
      getSkillsAsCategories()
        .map((c) => `### ${c.name}\n${c.skills.join(", ")}`)
        .join("\n")
    )
  );

  parts.push(
    section(
      "Professional Experience",
      experiences
        .map((e) =>
          [
            `### ${e.title}, ${e.company}`,
            `Period: ${e.period}`,
            ...(e.location ? [`Location: ${e.location}`] : []),
            `Technologies: ${e.technologies.join(", ")}`,
            normalizeText(e.description),
          ].join("\n")
        )
        .join("\n\n")
    )
  );

  parts.push(
    section(
      "Education",
      education
        .map((e) =>
          [
            `### ${e.degree}`,
            `${e.institution} (${e.year}), ${e.location}`,
            ...(e.gpa ? [`GPA: ${e.gpa}`] : []),
            `Focus: ${e.focus}`,
          ].join("\n")
        )
        .join("\n\n")
    )
  );

  parts.push(
    section(
      "Languages",
      languages
        .map((l) => `- ${l.name}: ${l.level}${l.certification ? ` (${l.certification})` : ""}`)
        .join("\n")
    )
  );

  parts.push(
    section(
      "Projects",
      [
        "Listed in Ahmed's order, strongest and newest first.",
        ...projects.map((p) =>
          [
            `### ${p.title}${p.inDevelopment ? " (In Development)" : ""}`,
            ...(p.period ? [`Period: ${p.period}`] : []),
            normalizeText(p.detailedDescription ?? p.description),
            `Technologies: ${p.technologies.join(", ")}`,
            linkLine("Code", p.github, p.code_available),
            linkLine("Demo", p.demo, p.demo_available),
          ].join("\n")
        ),
      ].join("\n\n")
    )
  );

  parts.push(
    section(
      "Freelance Projects",
      freelanceProjects
        .map((p) =>
          [
            `### ${p.title}`,
            `Period: ${p.period}`,
            normalizeText(p.description),
            `Technologies: ${p.technologies.join(", ")}`,
            linkLine("Code", p.github, p.code_available),
            linkLine("Demo", p.demo, p.demo_available),
          ].join("\n")
        )
        .join("\n\n")
    )
  );

  // Grouped by category so the model has the "publications" and "certifications"
  // anchors that SYSTEM_INSTRUCTION explicitly tells it to answer about.
  const byCategory = new Map<string, typeof personalAchievements>();
  for (const a of personalAchievements) {
    byCategory.set(a.category, [...(byCategory.get(a.category) ?? []), a]);
  }
  parts.push(
    section(
      "Achievements, Publications and Certifications",
      [...byCategory.entries()]
        .map(([category, items]) =>
          [
            `### ${category}`,
            items
              .map((a) =>
                [
                  `- ${a.title} (${a.year})`,
                  `  ${normalizeText(a.description).replace(/\n/g, "\n  ")}`,
                  `  Link: ${a.link ?? "not available"}`,
                ].join("\n")
              )
              .join("\n"),
          ].join("\n")
        )
        .join("\n\n")
    )
  );

  parts.push(
    section(
      "Courses",
      [coursesNote, ...courses.map((c) => `- ${c.title}, ${c.provider} (${c.date})`)].join("\n")
    )
  );

  parts.push(
    section(
      "Contact Information",
      [
        `Email: ${contact.email}`,
        `Phone: ${contact.phone}`,
        `Location: ${contact.location}`,
        `Work eligibility: ${workEligibility}`,
        `Portfolio: ${links.portfolio}`,
        `GitHub: ${links.github}`,
        `LinkedIn: ${links.linkedin}`,
        `Credly: ${links.credly}`,
      ].join("\n")
    )
  );

  parts.push(section("Website Sections", siteMap));

  return parts.join("\n\n");
}

// Pure and dependent only on statically imported literals, so this is evaluated
// once per cold start and is a constant thereafter.
export const PORTFOLIO_CONTEXT: string = buildPortfolioContext();
