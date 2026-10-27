"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { projects, projectPages } from "@/lib/projects"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ExternalLink, Check, Filter, ChevronDown, X, Smartphone, Briefcase, BookOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAchievements } from "@/lib/achievements-context"
import Slideshow from "@/components/ui/Slideshow"
import ImageModal from "@/lib/image-modal"
import ProjectDetail from "@/components/project-detail"
import { Tooltip } from "@/components/ui/tooltip"
import type { ProjectImage } from "@/lib/types"
import { cn } from "@/lib/utils"
import { opensNewTab, projectPath, projectSlugForPath, returnToProjectList } from "@/lib/routes"

// Tags a card shows before folding the rest into a "+N" chip; the project page lists them all.
const VISIBLE_TECH_COUNT = 6

/**
 * A card's description, cut to five lines when the project has a write-up of its
 * own, with a link that opens it.
 */
function ProjectDescription({
  text,
  title,
  href,
  onOpen,
}: {
  text: string
  title: string
  href?: string
  onOpen: (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <div className="px-6 pt-4">
      <p className={cn("text-sm text-green-300/70 whitespace-pre-line", href && "line-clamp-5")}>{text}</p>
      {href && (
        <a
          href={href}
          onClick={onOpen}
          className="mt-2 inline-flex items-center gap-1 text-sm text-green-400 underline-offset-4 hover:text-green-300 hover:underline"
        >
          {/* The name is in the link text, not only an aria-label, so search engines read a descriptive link. */}
          Read more<span className="sr-only"> about {title}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

export default function Projects() {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(["all"]))
  const technologies = Array.from(new Set(projects.flatMap((project) => project.technologies))).sort()
  const { clickProjectDemo, viewProject, visitTab, clickProjectCode } = useAchievements()
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set())
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isTablet, setIsTablet] = useState<boolean>(false)
  // The open lightbox: the slides it steps through and the one on show.
  const [lightbox, setLightbox] = useState<{ images: ProjectImage[]; index: number } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  // /projects/<slug> opens that project's write-up in place of the cards.
  const pathname = usePathname()
  const openSlug = projectSlugForPath(pathname)
  const openIndex = projectPages.findIndex((project) => project.slug === openSlug)
  const openProject = openIndex >= 0 ? projectPages[openIndex] : null
  const rootRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("projects")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  // Check if all projects have been viewed
  useEffect(() => {
    viewedProjects.forEach(projectId => {
      viewProject(projectId);
    });
  }, [viewedProjects, viewProject])

  // Check window size for mobile and tablet
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially to set the state

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle click outside dropdown and modal to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to toggle filters
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => {
      const newFilters = new Set(prev)
      
      // Handle "all" filter specially
      if (filterId === "all") {
        // If clicking on "all" and it's not already the only selected filter
        if (!(newFilters.size === 1 && newFilters.has("all"))) {
          return new Set(["all"])
        }
        return prev // Don't allow deselecting "all" if it's the only filter
      } else {
        // If toggling a technology filter
        if (newFilters.has("all")) {
          newFilters.delete("all") // Remove "all" when selecting specific tech
        }
        
        if (newFilters.has(filterId)) {
          newFilters.delete(filterId)
          // If no filters left, select "all"
          if (newFilters.size === 0) {
            newFilters.add("all")
          }
        } else {
          newFilters.add(filterId)
        }
        return newFilters
      }
    })
  }

  // Filter projects based on selected technologies
  const filteredProjects = selectedFilters.has("all") 
    ? projects 
    : projects.filter((project) => 
        project.technologies.some(tech => selectedFilters.has(tech))
      )

  const handleProjectView = (projectId: string) => {
    if (!viewedProjects.has(projectId)) {
      const newViewedProjects = new Set(viewedProjects)
      newViewedProjects.add(projectId)
      setViewedProjects(newViewedProjects)
      viewProject(projectId)
    }
  }

  const handleDemoClick = () => {
    clickProjectDemo()
  }

  const openLightbox = useCallback((images: ProjectImage[], index: number) => setLightbox({ images, index }), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const showSlide = useCallback((index: number) => setLightbox((current) => current && { ...current, index }), [])

  // The tab's own scroll box (components/terminal.tsx); the page around it stays put.
  const scrollBox = () => rootRef.current?.closest<HTMLElement>("[data-tab-scroll]") ?? null

  // Every link to a project is a real link: crawlers follow it, and a cmd, ctrl or
  // middle click opens the project in a new tab. A plain click opens it here, as a
  // new history entry, so Back returns to where the visitor was. Each entry counts
  // its steps back to the cards, so "Projects" can return there after browsing
  // from one project to the next; 0 means the visit started on a project.
  const handleOpenProject = (event: React.MouseEvent<HTMLAnchorElement>, slug: string, section?: string) => {
    if (opensNewTab(event)) return
    event.preventDefault()
    const state = window.history.state
    let projectDepth = state?.projectDepth > 0 ? state.projectDepth + 1 : 0
    if (!openProject) {
      // Leaving the cards: note on their entry where they were scrolled to and which
      // card was used, for when Back brings the visitor here again.
      window.history.replaceState({ ...state, projectsScroll: scrollBox()?.scrollTop ?? 0, projectsFocus: slug }, "")
      projectDepth = 1
    }
    window.history.pushState({ projectDepth }, "", section ? `${projectPath(slug)}#${section}` : projectPath(slug))
  }

  const handleBackToProjects = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (opensNewTab(event)) return
    event.preventDefault()
    returnToProjectList()
  }

  // After the view changes, put the scroll and the keyboard focus where a page
  // load would: the top of a write-up (or the section its link named) with focus
  // on its title, or the cards as they were left with focus on the one used.
  const shownSlugRef = useRef(openProject?.slug ?? null)
  useLayoutEffect(() => {
    const shownSlug = openProject?.slug ?? null
    const previousSlug = shownSlugRef.current
    shownSlugRef.current = shownSlug
    const box = scrollBox()
    if (!box) return
    // Reading a write-up counts as viewing the project, however the visitor got here.
    if (openProject) handleProjectView(openProject.title)
    const state = window.history.state
    const hashTarget = window.location.hash && document.getElementById(window.location.hash.slice(1))
    // The target's scroll-margin leaves room for the pinned bar, as the browser's own jump does.
    const scrollTopFor = (target: HTMLElement) =>
      target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - parseFloat(getComputedStyle(target).scrollMarginTop)
    if (previousSlug === shownSlug) {
      // The tab has just opened. Back from another tab, pick up where the visitor
      // left off (components/terminal.tsx keeps the position); on a page load,
      // follow a #section in the address. Focus stays on the tab that was used.
      if (typeof state?.projectsScroll === "number") box.scrollTop = state.projectsScroll
      else if (hashTarget) box.scrollTop = scrollTopFor(hashTarget)
      return
    }
    if (shownSlug) {
      box.scrollTop = hashTarget ? scrollTopFor(hashTarget) : 0
      headingRef.current?.focus({ preventScroll: true })
    } else {
      box.scrollTop = state?.projectsScroll ?? 0
      const card = state?.projectsFocus && box.querySelector<HTMLElement>(`[data-project-slug="${state.projectsFocus}"]`)
      if (card) card.focus({ preventScroll: true })
    }
    // Runs when the shown project changes, never on other renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProject?.slug])

  // Create filter options including "all"
  const filterOptions = [
    { id: "all", label: "All Projects" },
    ...technologies.map(tech => ({ id: tech, label: tech }))
  ]

  // Filter options based on search term
  const filteredOptions = filterOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get the count of selected filters (excluding "all")
  const selectedCount = selectedFilters.has("all") 
    ? 0 
    : selectedFilters.size;

  const lightboxModal = (
    <ImageModal
      images={lightbox?.images ?? []}
      index={lightbox?.index ?? null}
      onIndexChange={showSlide}
      onClose={closeLightbox}
    />
  )

  if (openProject) {
    return (
      <div ref={rootRef} className="bg-black text-green-500 p-6 min-h-[70vh] font-mono custom-scrollbar">
        <ProjectDetail
          project={openProject}
          previous={projectPages[(openIndex - 1 + projectPages.length) % projectPages.length]}
          next={projectPages[(openIndex + 1) % projectPages.length]}
          headingRef={headingRef}
          onBack={handleBackToProjects}
          onOpenProject={handleOpenProject}
          onImageClick={openLightbox}
        />
        {lightboxModal}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="bg-black text-green-500 p-6 min-h-[70vh] font-mono custom-scrollbar">
      <h1 className="text-2xl mb-6 border-b border-green-500 pb-2">Projects</h1>

      <div className="mb-8 relative">
        {/* Mobile Filter Button */}
        {isMobile ? (
          <button 
            onClick={() => setModalOpen(true)} 
            className="flex items-center gap-2 mb-4 text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-md px-4 py-2 transition-all duration-200 shadow-md"
          >
            <Filter className="h-5 w-5" />
            <span>Filter Technologies</span>
            {selectedCount > 0 && (
              <span className="bg-green-500 text-black rounded-full px-2 py-0.5 text-xs ml-2">
                {selectedCount}
              </span>
            )}
          </button>
        ) : (
          <div className="mb-8" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-md px-4 py-2 transition-all duration-200 shadow-md"
            >
              <Filter className="h-5 w-5" />
              <span>Filter by Technology</span>
              {selectedCount > 0 && (
                <span className="bg-green-500 text-black rounded-full px-2 py-0.5 text-xs">
                  {selectedCount}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Dropdown */}
            {dropdownOpen && (
              <div className="absolute z-50 mt-2 w-full max-w-md bg-gray-900 border border-green-500 rounded-md shadow-lg overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-green-500/30">
                  <h3 className="text-green-400 font-bold">Filter by Technology</h3>
                  <button 
                    onClick={() => setDropdownOpen(false)}
                    className="text-green-400 hover:text-green-300 p-1 rounded-full hover:bg-green-500/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Search Input */}
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Search technologies..."
                    className="w-full p-2 border border-green-500 rounded-md bg-gray-800 text-green-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="p-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleFilter(option.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-200 ${
                          selectedFilters.has(option.id)
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-green-500/30 hover:border-green-500/50 text-green-400/70'
                        }`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                          selectedFilters.has(option.id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-green-500/50'
                        }`}>
                          {selectedFilters.has(option.id) && (
                            <Check className="h-3 w-3 text-black" />
                          )}
                        </div>
                        <span className="truncate text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Filter Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
            <div ref={modalRef} className="bg-gray-800 p-4 rounded-lg w-11/12 max-w-md max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center border-b border-green-500/30 pb-3 mb-3">
                <h3 className="text-green-400 font-bold">Filter by Technology</h3>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="text-green-400 hover:text-green-300 p-1 rounded-full hover:bg-green-500/10" 
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search Input for Mobile */}
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search technologies..."
                  className="w-full p-2 border border-green-500 rounded-md bg-gray-800 text-green-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-y-auto flex-grow custom-scrollbar p-1">
                <div className="grid grid-cols-2 gap-2">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleFilter(option.id)}
                      className={`flex items-center gap-2 px-2 py-2 rounded-md border transition-all duration-200 ${
                        selectedFilters.has(option.id)
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-green-500/30 hover:border-green-500/50 text-green-400/70'
                      }`}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                        selectedFilters.has(option.id)
                          ? 'border-green-500 bg-green-500'
                          : 'border-green-500/50'
                      }`}>
                        {selectedFilters.has(option.id) && (
                          <Check className="h-3 w-3 text-black" />
                        )}
                      </div>
                      <span className="truncate text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-green-500/30 mt-3 flex justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          // Determine which images to show
          let imagesToShow = project.images; // Default to project images
          if (project.inDevelopment) {
            if (project.images && project.images.length === 1 && project.images[0].src === "/in-development.png") {
              imagesToShow = [{ src: "/in-development.png", alt: "Still In Development" }];
            } else if (project.images && project.images.length > 0 && project.images[0].src !== "/in-development.png") {
              imagesToShow = project.images;
            } else {
              imagesToShow = [{ src: "/in-development.png", alt: "Still In Development" }];
            }
          }

          const slug = project.slug
          const projectHref = slug ? projectPath(slug) : undefined
          const openThis = (event: React.MouseEvent<HTMLAnchorElement>) => slug && handleOpenProject(event, slug)
          const isPlaceholder = imagesToShow.length === 1 && imagesToShow[0].src === "/in-development.png"
          // Technologies picked in the filter go first, so a match is never folded into "+N".
          const orderedTechnologies = selectedFilters.has("all")
            ? project.technologies
            : [
                ...project.technologies.filter((tech) => selectedFilters.has(tech)),
                ...project.technologies.filter((tech) => !selectedFilters.has(tech)),
              ]
          const visibleTechnologies = orderedTechnologies.slice(0, VISIBLE_TECH_COUNT)
          const hiddenTechnologies = orderedTechnologies.slice(VISIBLE_TECH_COUNT)

          return (
            // Each card spans five rows of the grid and shares them with the cards
            // beside it (subgrid), so images, titles, text, tags and buttons line up.
            <Card
              key={project.title}
              className={`row-span-5 grid grid-rows-subgrid gap-0 bg-gray-900 transition-shadow hover:shadow-lg hover:shadow-green-500/20 ${project.inDevelopment ? 'border-yellow-500/50' : 'border-green-500'}`}
              onMouseEnter={() => handleProjectView(project.title)}
            >
              <div className="px-6 pt-6">
                <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-black/40 shadow-lg">
                  <Slideshow images={imagesToShow} onImageClick={openLightbox} />
                  {isPlaceholder && (
                    <div className="absolute inset-0 bg-yellow-500/10 flex flex-col items-center justify-center border border-yellow-500/30 rounded-md pointer-events-none">
                      <span className="text-yellow-500 text-lg font-bold">Under Development</span>
                      <p className="text-yellow-500/70 text-sm mt-2">Coming Soon!</p>
                    </div>
                  )}
                </div>
              </div>

              <CardHeader className="space-y-0 pb-0 pt-5">
                <CardTitle className="text-green-400">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* The title opens the project's write-up, which has an address of its own to share. */}
                    {projectHref ? (
                      <a href={projectHref} onClick={openThis} data-project-slug={slug} className="underline-offset-4 hover:underline">
                        {project.title}
                      </a>
                    ) : (
                      <span>{project.title}</span>
                    )}
                    {project.inDevelopment && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {project.statusLabel ?? "In Development"}
                      </span>
                    )}
                  </div>
                  {project.role && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-green-300/60">
                      <Briefcase size={12} aria-hidden="true" className="shrink-0" />
                      {project.role}
                    </p>
                  )}
                  {project.platforms && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-green-300/60">
                      <Smartphone size={12} aria-hidden="true" />
                      {project.platforms.join(" · ")}
                    </p>
                  )}
                </CardTitle>
              </CardHeader>

              <ProjectDescription text={project.description} title={project.title} href={projectHref} onOpen={openThis} />

              <div className="px-6 pt-4 flex flex-wrap content-start gap-2">
                {visibleTechnologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="border-green-500 text-green-400">
                    {tech}
                  </Badge>
                ))}
                {hiddenTechnologies.length > 0 && (() => {
                  const label = `${hiddenTechnologies.length} more: ${hiddenTechnologies.join(", ")}`
                  const chipClass = cn(badgeVariants({ variant: "outline" }), "border-green-500/50 text-green-400/80")
                  return projectHref ? (
                    <a href={projectHref} onClick={openThis} title={label} aria-label={label} className={cn(chipClass, "hover:border-green-500 hover:text-green-300")}>
                      +{hiddenTechnologies.length}
                    </a>
                  ) : (
                    <span title={label} aria-label={label} className={chipClass}>
                      +{hiddenTechnologies.length}
                    </span>
                  )
                })()}
              </div>

              <CardFooter className="flex flex-wrap items-start justify-between gap-2 pt-6">
                {project.github && (
                  <Tooltip 
                    text="Sorry, the code is confidential and not public."
                    isMobile={isMobile}
                    isTablet={isTablet}
                    showTooltip={!project.code_available}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-green-500 text-green-400 bg-black hover:bg-green-500/20 ${project.code_available ? '' : 'opacity-50 cursor-not-allowed'}`}
                      asChild
                      disabled={!project.code_available}
                      onClick={project.code_available ? () => clickProjectCode(project.title) : undefined}
                    >
                      {project.code_available ? (
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github size={16} className="mr-2" />
                          Code
                        </a>
                      ) : (
                        <span className="text-gray-500">
                          <Github size={16} className="mr-2" />
                          Code
                        </span>
                      )}
                    </Button>
                  </Tooltip>
                )}

                {project.caseStudy && slug && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                    asChild
                  >
                    <a href={`${projectPath(slug)}#case-study`} onClick={(event) => handleOpenProject(event, slug, "case-study")}>
                      <BookOpen size={16} className="mr-2" />
                      Case study
                    </a>
                  </Button>
                )}

                {/* A private project with a case study shows that instead of a dead Demo button. */}
                {!(project.caseStudy && !project.demo_available) && (
                  <Tooltip
                    text={project.demoTooltip ?? (project.code_available
                      ? "This project is only available by cloning the GitHub repo and not hosted unfortunately."
                      : "This project isn't publicly hosted.")}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    showTooltip={project.demoTooltip ? true : project.inDevelopment ? false : !project.demo_available}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-green-500 text-green-400 bg-black hover:bg-green-500/20 ${project.demo_available ? '' : 'opacity-50 cursor-not-allowed'}`}
                      asChild
                      disabled={!project.demo_available || project.inDevelopment}
                      onClick={project.demo_available && !project.inDevelopment ? handleDemoClick : undefined}
                    >
                      {project.demo && project.demo_available ? (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={16} className="mr-2" />
                          Demo
                        </a>
                      ) : (
                        <span className="text-gray-500">
                          <ExternalLink size={16} className="mr-2" />
                          {project.demoLabel ?? "Demo"}
                        </span>
                      )}
                    </Button>
                  </Tooltip>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-green-400">
          <p>No projects found with the selected filters.</p>
          <Button variant="link" onClick={() => setSelectedFilters(new Set(["all"]))} className="text-green-500 mt-2">
            Show all projects
          </Button>
        </div>
      )}

      {lightboxModal}
    </div>
  )
}

