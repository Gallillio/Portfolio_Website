"use client"

import { useState, useEffect, useRef } from "react"
import { projects } from "@/lib/projects"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAchievements } from "@/lib/achievements-context"
import Image from "next/image"
import Slideshow from "@/components/ui/Slideshow"
import ImageModal from "@/lib/image-modal"

export default function Projects() {
  const [filter, setFilter] = useState<string>("all")
  const technologies = Array.from(new Set(projects.flatMap((project) => project.technologies))).sort()
  const { clickProjectDemo, viewProject, visitTab } = useAchievements()
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set())
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isTablet, setIsTablet] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

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

  const filteredProjects =
    filter === "all" ? projects : projects.filter((project) => project.technologies.includes(filter))

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
      // If on mobile and the modal is already open, close it
      closeModal();
    } else if (!isMobile) {
      // If not on mobile, open the modal
      setSelectedImage(imageSrc);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono custom-scrollbar">
      <h2 className="text-2xl mb-6 border-b border-green-500 pb-2">Projects</h2>

      <div className="mb-6">
        <div className="flex flex-nowrap overflow-x-auto pb-2">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
            <TabsList className="bg-gray-900 border border-green-500 inline-flex w-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap"
              >
                All
              </TabsTrigger>
              {technologies.map((tech) => (
                <TabsTrigger
                  key={tech}
                  value={tech}
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap"
                >
                  {tech}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <Card
            key={index}
            className="bg-gray-900 border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all"
            onMouseEnter={() => handleProjectView(project.title)}
          >
            <CardHeader>
              <CardTitle className="text-green-400">{project.title}</CardTitle>
              <CardDescription className="text-green-300/70 whitespace-pre-line">{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 mb-4 overflow-hidden rounded-md bg-black/50 flex items-center justify-center">
                <Slideshow images={project.images} onImageClick={handleImageClick} />
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
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-green-500 text-green-400 bg-black ${project.codeAvailable ? '' : 'opacity-50 cursor-not-allowed'}`}
                    asChild
                    disabled={!project.codeAvailable}
                  >
                    {project.codeAvailable ? (
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
                  {/* Tooltip for Code Availability */}
                  {!project.codeAvailable && (
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${isMobile || isTablet ? 'w-28' : 'w-64'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                      <div className="bg-gray-900 border border-green-500 p-2 rounded-md shadow-lg text-xs text-green-400">
                        <p className="text-center">Sorry, the code is confidential and not public.</p>
                        {/* Triangle Pointer */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-green-500 transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {project.demo && project.demo_available ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                  asChild
                  onClick={handleDemoClick}
                >
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} className="mr-2" />
                    Demo
                  </a>
                </Button>
              ) : (
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-gray-500 bg-black opacity-50 cursor-not-allowed"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Demo
                  </Button>
                  {/* Custom Tooltip for demo availability */}
                  {!project.demo_available && (
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${isMobile ? 'w-28' : 'w-64'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                      <div className="bg-gray-900 border border-green-500 p-2 rounded-md shadow-lg text-xs text-green-400">
                        <p className="text-center">This project is only available by cloning the GitHub repo and not hosted unfortunately.</p>
                        {/* Triangle Pointer */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-green-500 transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-green-400">
          <p>No projects found with the selected filter.</p>
          <Button variant="link" onClick={() => setFilter("all")} className="text-green-500 mt-2">
            Show all projects
          </Button>
        </div>
      )}

      <ImageModal isOpen={isModalOpen} imageSrc={selectedImage} onClose={closeModal} />
    </div>
  )
}

