import Link from "next/link"
import Image from "next/image"
import {
  experiences,
  freelanceProjects,
  education,
  personalAchievements,
  skills,
  courses,
  links,
} from "@/lib/profile-data"
import { introduction, headline, languages, contact, availability } from "@/lib/profile-extras"
import { NAME, pageMetadata, summarise, aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/seo"
import StaticPage, { Section, JsonLd, linkClass, inlineLinkClass } from "@/components/static-page"

// Everything the terminal's About and Achievements tabs hold, as one plain page,
// so search engines and AI assistants can read it without clicking a tab.

export const metadata = pageMetadata({
  title: `About ${NAME} · AI Engineer in Cairo`,
  description: summarise(introduction[0]),
  path: "/about",
})

// Some lines end with a URL, such as a LinkedIn post; render it as a link.
function withLinks(text: string) {
  return text.split(/(https?:\/\/\S+)/).map((part, index) =>
    part.startsWith("http") ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className={`${inlineLinkClass} break-all`}>
        {part}
      </a>
    ) : (
      part
    )
  )
}

// Descriptions keep their first line as a summary and list the rest, one per line.
const splitLines = (text: string) => {
  const [first, ...rest] = text.split("\n")
  return { first, rest: rest.map((line) => line.replace(/^(•|-) /, "")) }
}

const recognition = personalAchievements.filter((a) =>
  ["Publication", "Award", "Content Creation"].includes(a.category)
)
const certifications = personalAchievements.filter((a) => a.category === "Certification")

const profiles = [
  { href: links.linkedin, label: "LinkedIn" },
  { href: links.github, label: "GitHub" },
  { href: links.credly, label: "Credly" },
  { href: links.tiktok, label: "TikTok" },
]

export default function AboutPage() {
  return (
    <StaticPage path="/about">
      <JsonLd data={aboutPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd([{ name: "About", path: "/about" }])} />

      <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">About {NAME}</h1>
          <p className="mt-1 text-green-400">{headline}</p>
          {introduction.map((paragraph) => (
            <p key={paragraph} className="mt-4">
              {paragraph}
            </p>
          ))}
          <p className="mt-4 text-sm text-gray-400">{availability}</p>
        </div>
        <Image
          src="/Me.jpg"
          alt={`Portrait of ${NAME}`}
          width={768}
          height={1024}
          priority
          sizes="144px"
          className="h-auto w-28 shrink-0 rounded border border-green-500/40 sm:w-36"
        />
      </div>

      <Section title="Experience">
        <div className="space-y-6">
          {experiences.map((job) => {
            const { first, rest } = splitLines(job.description)
            return (
              <div key={`${job.company}-${job.period}`}>
                <h3 className="font-semibold text-gray-100">
                  {job.title}, {job.company}
                </h3>
                <p className="text-sm text-gray-400">
                  {[job.period, job.location].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-2">{first}</p>
                {rest.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {rest.map((line) => (
                      <li key={line}>{withLinks(line)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Freelance and own projects">
        <div className="space-y-4">
          {freelanceProjects.map((project) => {
            const { first, rest } = splitLines(project.description)
            return (
              <div key={project.title}>
                <h3 className="font-semibold text-gray-100">
                  {project.projectSlug ? (
                    <Link href={`/projects/${project.projectSlug}`} className={linkClass}>
                      {project.title}
                    </Link>
                  ) : (
                    project.title
                  )}
                </h3>
                <p className="text-sm text-gray-400">{project.period}</p>
                <p className="mt-2">{first}</p>
                {rest.map((line) => (
                  <p key={line} className="mt-1">
                    {line}
                  </p>
                ))}
              </div>
            )
          })}
        </div>
        <p className="mt-4">
          All projects, with screenshots:{" "}
          <Link href="/projects" className={inlineLinkClass}>
            Projects
          </Link>
          .
        </p>
      </Section>

      <Section title="Education">
        <div className="space-y-4">
          {education.map((entry) => (
            <div key={entry.institution}>
              <h3 className="font-semibold text-gray-100">
                {entry.degree}, {entry.institution}
              </h3>
              <p className="text-sm text-gray-400">{[entry.year, entry.location].filter(Boolean).join(" · ")}</p>
              <p className="mt-1">
                {entry.focus}
                {"gpa" in entry && entry.gpa ? `. GPA ${entry.gpa}` : ""}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Publications and awards">
        <div className="space-y-4">
          {recognition.map((item) => {
            const { first, rest } = splitLines(item.description)
            return (
              <div key={item.id}>
                <h3 className="font-semibold text-gray-100">{item.title}</h3>
                <p className="text-sm text-gray-400">
                  {item.category} · {item.year}
                </p>
                <p className="mt-1">{first}</p>
                {rest.map((line) => (
                  <p key={line} className="mt-1">
                    {line}
                  </p>
                ))}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={`${linkClass} mt-1 inline-block`}>
                    {item.linkText ?? "View"}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Certifications">
        <div className="space-y-4">
          {certifications.map((item) => {
            const { first, rest } = splitLines(item.description)
            return (
              <div key={item.id}>
                <h3 className="font-semibold text-gray-100">{item.title}</h3>
                <p className="mt-1">{first}</p>
                {rest.length > 0 && (
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {rest.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-1 flex flex-wrap gap-x-5">
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {item.linkText ?? "View"}
                    </a>
                  )}
                  {item.id === "azure-ai-engineer-associate" && (
                    <Link href="/azure-certification" className={linkClass}>
                      Details
                    </Link>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Skills">
        <dl className="space-y-3">
          {Object.entries(skills).map(([group, items]) => (
            <div key={group}>
              <dt className="font-semibold text-gray-100">{group}</dt>
              <dd>{items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Languages">
        <ul className="list-disc space-y-1 pl-5">
          {languages.map((language) => (
            <li key={language.name}>
              {language.name}: {language.level}
              {language.certification ? ` (${language.certification})` : ""}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Courses">
        <ul className="list-disc space-y-1 pl-5">
          {courses.map((course) => (
            <li key={course.title}>
              {course.title}, {course.provider} ({course.date})
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          Email:{" "}
          <a href={`mailto:${contact.email}`} className={inlineLinkClass}>
            {contact.email}
          </a>
        </p>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {profiles.map((profile) => (
            <a key={profile.href} href={profile.href} target="_blank" rel="noopener noreferrer me" className={linkClass}>
              {profile.label}
            </a>
          ))}
        </p>
      </Section>
    </StaticPage>
  )
}
