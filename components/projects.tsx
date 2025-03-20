"use client"

import { useState, useEffect } from "react"
import { projects } from "@/lib/projects"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAchievements } from "@/lib/achievements-context"

export default function Projects() {
  const [filter, setFilter] = useState<string>("all")
  const technologies = Array.from(new Set(projects.flatMap((project) => project.technologies))).sort()
  const { clickProjectDemo, viewProject, visitTab } = useAchievements()
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set())
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)

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
              <CardDescription className="text-green-300/70">{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 mb-4 overflow-hidden rounded-md bg-black/50 flex items-center justify-center">
                {/* {project.image ? (
                  <Image src={project.image || "/placeholder.svg"} alt={project.title} layout="fill" objectFit="cover" />
                ) : (
                  <Code size={48} className="text-green-500/30" />
                )} */}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                  asChild
                >
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github size={16} className="mr-2" />
                    Code
                  </a>
                </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-400 bg-black opacity-50 cursor-not-allowed"
                  title="This project is only available by cloning the GitHub repo and not hosted unfortunately."
                  asChild
                >
                  <span>
                    <ExternalLink size={16} className="mr-2" />
                    Demo (Unavailable)
                  </span>
                </Button>
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
    </div>
  )
}

