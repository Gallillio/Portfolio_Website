"use client"

import { useState, useEffect, useRef } from "react"
import { projects } from "@/lib/projects"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ExternalLink, Check, Filter, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAchievements } from "@/lib/achievements-context"
import Slideshow from "@/components/ui/Slideshow"
import ImageModal from "@/lib/image-modal"
import { Tooltip } from "@/components/ui/tooltip"

export default function Projects() {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(["all"]))
  const technologies = Array.from(new Set(projects.flatMap((project) => project.technologies))).sort()
  const { clickProjectDemo, viewProject, visitTab, clickProjectCode } = useAchievements()
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set())
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isTablet, setIsTablet] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Close modal if isMobile becomes true
  useEffect(() => {
    if (isMobile && isModalOpen) {
      closeModal();
    }
  }, [isMobile, isModalOpen]);

  // Close modal if isMobile becomes false
  useEffect(() => {
    if (!isMobile && modalOpen) {
      setModalOpen(false);
    }
  }, [isMobile, modalOpen]);

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

  const handleImageClick = (imageSrc: string) => {
    if (isMobile && isModalOpen) {
      closeModal();
    } else if (!isMobile) {
      setSelectedImage(imageSrc);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  // Create filter options including "all"
  const filterOptions = [
    { id: "all", label: "All Projects" },
    ...technologies.map(tech => ({ id: tech, label: tech }))
  ]

  // Get the count of selected filters (excluding "all")
  const selectedCount = selectedFilters.has("all") 
    ? 0 
    : selectedFilters.size;

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono custom-scrollbar">
      <h2 className="text-2xl mb-6 border-b border-green-500 pb-2">Projects</h2>

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
                <div className="p-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    {filterOptions.map((option) => (
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
              
              <div className="overflow-y-auto flex-grow custom-scrollbar p-1">
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.map((option) => (
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
        {filteredProjects.map((project, index) => (
          <Card
            key={index}
            className={`bg-gray-900 border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all hover:scale-[1.02] hover:-translate-y-1 ${project.inDevelopment ? 'border-2 border-yellow-500/50' : ''}`}
            onMouseEnter={() => handleProjectView(project.title)}
          >
            <CardHeader>
              <CardTitle className="text-green-400">
                {project.title}
                {project.inDevelopment && (
                  <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                    In Development
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-green-300/70 whitespace-pre-line">{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 mb-4 overflow-hidden rounded-md flex items-center justify-center">
                {project.inDevelopment ? (
                  <div className="h-full w-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 rounded-md">
                    <div className="text-center p-4">
                      <span className="text-yellow-500 text-lg font-bold">Under Development</span>
                      <p className="text-yellow-500/70 text-sm mt-2">Coming Soon!</p>
                    </div>
                  </div>
                ) : (
                  <Slideshow images={project.images} onImageClick={handleImageClick} />
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {project.technologies.map((tech, techIndex) => (
                  <Badge key={techIndex} variant="outline" className="border-green-500 text-green-400">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {project.github && (
                // Code Button 
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
              
              {/* Demo Button */}
              <Tooltip 
                text="This project is only available by cloning the GitHub repo and not hosted unfortunately."
                isMobile={isMobile}
                isTablet={isTablet}
                // showTooltip={!project.demo_available || project.inDevelopment}
                showTooltip={project.inDevelopment ? false : !project.demo_available}

                
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
                      Demo
                    </span>
                  )}
                </Button>
              </Tooltip>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-green-400">
          <p>No projects found with the selected filters.</p>
          <Button variant="link" onClick={() => setSelectedFilters(new Set(["all"]))} className="text-green-500 mt-2">
            Show all projects
          </Button>
        </div>
      )}

      <ImageModal 
        isOpen={isModalOpen} 
        imageSrc={selectedImage} 
        onClose={closeModal} 
        images={filteredProjects.find(project => project.images.some(img => img.src === selectedImage))?.images || []}
        setImageSrc={setSelectedImage}
      />
    </div>
  )
}

