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
  availability,
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

/** Tracking-only query params cost tokens and change nothing about where the link goes. */
function cleanUrl(url: string): string {
  return url.replace(/[?&](utm[^&#]*|tab=readme-ov-file)(?=$|[&#])/g, "").replace(/[?&]$/, "");
}

/**
 * projects.ts uses "#" as the sentinel for "no link". An unavailable link is
 * omitted rather than spelled out: the Projects preamble tells the model that a
 * missing Code/Demo line means there is none, which costs one line instead of
 * one per project.
 */
function linkLines(entries: [label: string, url: string | undefined, available: boolean | undefined][]): string[] {
  return entries
    .filter(([, url, available]) => available !== false && url && url !== "#")
    .map(([label, url]) => `${label}: ${cleanUrl(url as string)}`);
}

const STOPWORDS = new Set(
  "about after also because before being from have into more over that their them then there these they this through until were what when where which while with without would your".split(" ")
);

/** Lowercased words of a line, with the leading bullet and edge punctuation stripped. */
function words(line: string): { word: string; sentenceStart: boolean }[] {
  return line
    .replace(/^•\s*/, "")
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) =>
      sentence
        .split(/[\s/]+/)
        .map((raw) => raw.replace(/^[^\w~]+|[^\w%+]+$/g, "").replace(/^~|\+$/g, ""))
        .filter(Boolean)
        .map((word, i) => ({ word, sentenceStart: i === 0 }))
    );
}

/**
 * True when a description line adds nothing the source text does not already
 * say: every fact token (numbers, acronyms, proper nouns) appears in it, and so
 * do most of its content words. Sentence-initial capitals are grammar, not facts.
 */
function isCoveredBy(line: string, source: string): boolean {
  const haystack = source.toLowerCase();
  const tokens = words(line);
  const facts = tokens.filter(({ word, sentenceStart }) => /\d/.test(word) || (!sentenceStart && /[A-Z]/.test(word)));
  if (!facts.every(({ word }) => haystack.includes(word.toLowerCase()))) return false;

  const content = tokens.map(({ word }) => word.toLowerCase()).filter((w) => /^[a-z-]{4,}$/.test(w) && !STOPWORDS.has(w));
  if (content.length === 0) return true;
  return content.filter((w) => haystack.includes(w)).length / content.length >= 0.8;
}

/** Everything the Projects section says about a project, for coverage checks. */
function projectText(p: (typeof projects)[number]): string {
  return [p.title, p.role, p.detailedDescription ?? p.description, p.technologies.join(", "), p.github, p.demo].join("\n");
}

/**
 * Roles whose work is also written up as a project (ISYS -> SIA, ESLSCA -> the
 * admissions chatbot) used to send the same facts twice. Bullets fully covered
 * by the project's text are dropped here; the lead line, which ties the role to
 * the project, always stays. Only the model's copy changes, never the page.
 */
function dedupeAgainstProjects(description: string, company: string): string {
  const key = company.split(/[,(]/)[0].trim().toLowerCase();
  const related = projects.filter((p) => `${p.title} ${p.role ?? ""}`.toLowerCase().includes(key));
  if (related.length === 0) return description;

  const source = related.map(projectText).join("\n");
  return description
    .split("\n")
    .filter((line, i) => i === 0 || !isCoveredBy(line, source))
    .join("\n");
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
        // Item 1 already says SIA is his main work and where it is described.
        "Ranked by Ahmed: use this order for his most impressive work, and the periods for recent work.",
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
            dedupeAgainstProjects(normalizeText(e.description), e.company),
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
        "Listed in Ahmed's order, strongest and newest first. A Code or Demo line appears only when a public link exists; without one, there is none.",
        ...projects.map((p) =>
          [
            `### ${p.title}${p.inDevelopment ? ` (${p.statusLabel ?? "In Development"})` : ""}`,
            ...(p.period ? [`Period: ${p.period}`] : []),
            ...(p.role ? [`Role: ${p.role}`] : []),
            ...(p.platforms ? [`Platforms: ${p.platforms.join(", ")}`] : []),
            normalizeText(p.detailedDescription ?? p.description),
            `Technologies: ${p.technologies.join(", ")}`,
            ...linkLines([
              ["Code", p.github, p.code_available],
              ["Demo", p.demo, p.demo_available],
            ]),
          ].join("\n")
        ),
      ].join("\n\n")
    )
  );

  parts.push(
    section(
      "Freelance Projects",
      freelanceProjects
        .map((p) => {
          // Most freelance entries are short versions of a full Projects write-up.
          // Keep what the write-up lacks: that the work was freelance, plus any
          // line, technology, period or link it does not already carry.
          const key = p.title.split(":")[0].trim().toLowerCase();
          const full = projects.find((q) => q.title.toLowerCase().startsWith(key));
          const source = full ? projectText(full) : "";
          const description = normalizeText(p.description)
            .split("\n")
            .filter((line) => !full || !isCoveredBy(line, source));
          const technologies = full
            ? p.technologies.filter((t) => !full.technologies.includes(t))
            : p.technologies;
          return [
            `### ${p.title}${full ? ` (freelance; full write-up under Projects as ${full.title})` : ""}`,
            ...(!full || p.period !== full.period ? [`Period: ${p.period}`] : []),
            ...description,
            ...(technologies.length ? [`Technologies: ${technologies.join(", ")}`] : []),
            ...linkLines([
              ["Code", p.github, p.code_available],
              ["Demo", p.demo, p.demo_available],
            ]).filter((line) => !full || !source.includes(line.split(": ")[1])),
          ].join("\n");
        })
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
      "An item without a Link line has no public link.\n\n" +
      [...byCategory.entries()]
        .map(([category, items]) =>
          [
            `### ${category}`,
            items
              .map((a) =>
                [
                  `- ${a.title} (${a.year})`,
                  `  ${normalizeText(a.description).replace(/\n/g, "\n  ")}`,
                  ...(a.link ? [`  Link: ${cleanUrl(a.link)}`] : []),
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
        `Availability: ${availability}`,
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
