"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { experiences, education, freelanceProjects, personalAchievements, getSkillsAsCategories, courses } from "@/lib/profile-data"
import { useAchievements } from "@/lib/achievements-context"
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Github, ExternalLink, BookOpen, Trophy, ShieldCheck, Star, Languages, ChevronDown, ChevronUp, Check, Filter } from "lucide-react"
import type { ReactNode } from 'react'
import { parse } from 'date-fns'
import { skillLogos } from "@/lib/skill-logos"
import { Tooltip } from "@/components/ui/tooltip"

// Map of icon strings to Lucide components
const iconMap = {
  trophy: <Trophy className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  book: <BookOpen className="h-6 w-6" />,
  languages: <Languages className="h-6 w-6" />,
  shieldCheck: <ShieldCheck className="h-6 w-6" />,
} as const;

type TimelineItem = 
  | { type: 'achievement'; date: string; title: string; subtitle: string; category: string | undefined; targetTab: string; icon: ReactNode; link?: string; linkText?: string }
  | { type: 'experience'; title: string; company: string; period: string; description: string; targetTab: string }
  | { type: 'education'; degree: string; institution: string; year: string; focus: string; location: string; targetTab: string }
  | { type: 'freelance'; title: string; description: string; period: string; technologies: string[]; targetTab: string }

// Define a mapping for styles based on course providers
const providerStyles: { [key: string]: { width: number; height: number; unoptimized?: boolean; filterInvert?: boolean } } = {
  CompTIA: { width: 57, height: 57, unoptimized: true },
  IBM: { width: 36, height: 36 },
  Amazon: { width: 39, height: 39, filterInvert: true },
  "New Horizons": { width: 64, height: 46, filterInvert: true },
  Microsoft: { width: 30, height: 30 },

  // Add more providers and their styles as needed
  default: { width: 30, height: 30 }, // Default style
};

export default function About() {
  const { visitTab } = useAchievements()
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Try to get the saved tab from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('aboutActiveTab');
      // Validate that the saved tab is a valid option
      const validTabs = ['skills', 'timeline', 'experience', 'education', 'freelance', 'languages', 'courses'];
      return savedTab && validTabs.includes(savedTab) ? savedTab : "skills";
    }
    return "skills";
  })
  // const [activeTab, setActiveTab] = useState<string>("skills")
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [expandedExperiences, setExpandedExperiences] = useState<Set<number>>(new Set())
  const bioRef = useRef<HTMLDivElement>(null)

  // Add new state for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 767);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Add new state for timeline filters
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['achievement', 'experience', 'education', 'freelance']))

  // Add filter options
  const filterOptions = [
    { id: 'achievement', label: 'My Achievements' },
    { id: 'experience', label: 'Professional Experience' },
    { id: 'education', label: 'Education' },
    { id: 'freelance', label: 'Freelance Projects' },
  ]

  // Function to toggle filters
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId)
      } else {
        newFilters.add(filterId)
      }
      // Ensure at least one filter is selected
      if (newFilters.size === 0) {
        newFilters.add(filterId)
      }
      return newFilters
    })
  }

  // Add isTablet state
  const [isTablet, setIsTablet] = useState<boolean>(false);

  // Check window size for tablet
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024); // Set isTablet based on window width
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially to set the state

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for navigation messages from the terminal
  useEffect(() => {
    const handleSectionNavigation = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigate-about-section') {
        const sectionId = event.data.sectionId;
        console.log('About component received navigation request to section:', sectionId);
        if (sectionId && typeof sectionId === 'string') {
          setActiveTab(sectionId);
        }
      }
    };

    window.addEventListener('message', handleSectionNavigation);
    return () => {
      window.removeEventListener('message', handleSectionNavigation);
    };
  }, []);

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("about")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  // Load saved tab from localStorage after initial render
  useEffect(() => {
    const savedTab = localStorage.getItem('aboutActiveTab');
    const validTabs = ['skills', 'timeline', 'experience', 'education', 'freelance', 'languages', 'courses'];
    if (savedTab && validTabs.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save the active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboutActiveTab', activeTab);
    }
    // localStorage.setItem('aboutActiveTab', activeTab);
  }, [activeTab]);

  // Function to navigate to a specific tab
  const navigateToTab = (tab: string) => {
    console.log('Navigating to tab:', tab);
    
    // List of tabs that are part of the main terminal component
    const terminalTabs = ['terminal', 'projects', 'about', 'contact', 'my-achievements', 'your-achievements'];
    
    // Check if the target tab is in the main terminal tabs
    if (terminalTabs.includes(tab) && tab !== 'about') {
      console.log('Navigating to main terminal tab:', tab);
      
      try {
        // First try to use window.parent to affect the parent terminal
        window.parent.postMessage({ type: 'switch-tab', tabName: tab }, '*');
        
        // As a fallback, also dispatch a custom event
        const event = new CustomEvent('switch-terminal-tab', {
          detail: { tabName: tab }
        });
        window.dispatchEvent(event);
        
        // Third approach - try to find and click the tab directly 
        setTimeout(() => {
          const tabTrigger = document.querySelector(`[value="${tab}"]`) as HTMLElement;
          if (tabTrigger) {
            console.log('Found tab trigger, clicking:', tab);
            tabTrigger.click();
          }
        }, 100);
      } catch (error) {
        console.error('Error navigating to tab:', error);
      }
    } else {
      // For tabs within the About component
      console.log('Setting active tab within About component:', tab);
      setActiveTab(tab);
    }
  }

  const handleBioToggle = () => {
    if (isBioExpanded) {
      setIsBioExpanded(false)
      // Add a small delay to ensure the state is updated before scrolling
      setTimeout(() => {
        bioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      setIsBioExpanded(true)
    }
  }

  const toggleExperience = (index: number) => {
    setExpandedExperiences(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Function to close the mobile section modal when clicking outside
  const handleCloseModal = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setModalOpen(false);
    }
  };

  // Handle clicks outside the modal
  useEffect(() => {
    if (modalOpen) {
      document.addEventListener('mousedown', handleCloseModal);
    } else {
      document.removeEventListener('mousedown', handleCloseModal);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleCloseModal);
    };
  }, [modalOpen]);

  // Effect to scroll the active tab button into view
  useEffect(() => {
    const activeTabEl = document.querySelector(`[value="${activeTab}"]`) as HTMLElement;
    if (activeTabEl) {
      // Find the scroll container
      const scrollContainer = activeTabEl.closest('.overflow-x-auto') as HTMLElement;
      
      if (scrollContainer) {
        // On mobile/touch screens, position the tab at the far left
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        if (isTouchDevice || window.innerWidth < 768) {
          // Set scroll position directly to position the tab at the far left
          scrollContainer.scrollLeft = activeTabEl.offsetLeft;
        } else {
          // On desktop, use the native scrollIntoView
          activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      }
    }
  }, [activeTab]);

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono">
      <h2 className="text-2xl mb-6 border-b border-green-500 pb-2">About Me</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6">
        <Card ref={bioRef} className="bg-gray-900 border-green-500 md:col-span-3 lg:col-span-2 order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="text-green-400">Bio</CardTitle>
          </CardHeader>
          <CardContent className="text-green-300">
            <div className={`relative ${!isBioExpanded ? 'md:space-y-4' : ''}`}>
              <div className={`space-y-4 ${!isBioExpanded ? 'md:space-y-4' : ''}`}>
                <p className={`${!isBioExpanded ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                  I approach innovation with an AI-first mindset, I firmly believe in using AI tools along side with 
                  Software Engineering to bring advanced technology to life quickly and efficiently.
                </p>
                <p className={`${!isBioExpanded ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                  Drawing on diverse international experiences, I design and deploy cutting-edge AI
                  Solutions and Software Systems designed to streamline complex processes and deliver substantial value.
                </p>
                <p className={`${!isBioExpanded ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                  Leveraging robust technologies like Azure, IBM Watsonx, React.js, Next.js, and Cursor.
                </p>
                <p className={`${!isBioExpanded ? 'hidden' : ''}`}>
                  My work has consistently delivered transformative results, earning recognition in esteemed International
                  Publications like Elsevier&apos;s Procedia, Awards such as the Times Higher Education Award 2024, and through
                  my startup, GPTuBE, which was recognized as a Top 3 finalist in the GESAwards Africa, respresing Egypt,
                  and the entirety of North Africa internationally.
                </p>
              </div>
              {/* Gradient overlay for collapsed state */}
              <div className={`absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none transition-opacity duration-300 ${
                !isBioExpanded ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>
            <button
              onClick={handleBioToggle}
              className="mt-4 text-green-400 hover:text-green-300 transition-colors duration-200 flex items-center gap-1 relative z-10"
            >
              {isBioExpanded ? (
                <>
                  Read Less
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-green-500 order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="text-green-400">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 w-32 md:h-24 md:w-24 lg:h-48 lg:w-48 mx-auto mb-4 rounded-full overflow-hidden border-2 border-green-500 relative">
              <Image 
                src="/Me.jpg" 
                alt="Ahmed Galal Elzeky" 
                fill
                sizes="(max-width: 768px) 128px, (max-width: 1024px) 144px, 192px"
                className="object-cover"
                style={{ objectPosition: '50% 30%' }}
                priority
              />
            </div>
            <div className="text-center text-green-300">
              <h3 className="text-lg md:text-xl font-bold">Ahmed Galal Elzeky</h3>
              <p className="text-sm md:text-base text-green-400">AI & Software Engineer</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs list with horizontal scroll - only show on desktop */}
        {!isMobile && (
          <div className="mt-8 overflow-x-auto pb-2">
            <TabsList className="bg-gray-900 border border-green-500 inline-flex w-auto">
              <TabsTrigger value="skills" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Skills
              </TabsTrigger>
              <TabsTrigger value="timeline" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="experience" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Professional Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Education
              </TabsTrigger>
              <TabsTrigger value="freelance" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Freelance Projects
              </TabsTrigger>
              <TabsTrigger value="languages" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Languages
              </TabsTrigger>
              <TabsTrigger value="courses" className="custom-tab touch-optimized data-[state=active]:bg-green-500 data-[state=active]:text-black whitespace-nowrap">
                Courses
              </TabsTrigger>
            </TabsList>
          </div>
        )}
        
        {/* Mobile-friendly section selector */}
        {isMobile && (
          <div className="mb-6 mt-6 bg-gray-900 pt-3 pb-3 border border-green-500 rounded-md shadow-md">
            
            <div className="about-section-nav px-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'skills', label: 'Skills' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'education', label: 'Education' },
                  { id: 'freelance', label: 'Freelance' },
                  { id: 'languages', label: 'Languages' },
                  { id: 'courses', label: 'Courses' }
                ].map((section) => (
                  <button
                    key={section.id}
                    className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition-all touch-optimized
                      ${activeTab === section.id 
                        ? 'bg-green-500 text-black font-medium shadow-md transform scale-105' 
                        : 'bg-gray-800 text-green-300 border border-green-500/30 hover:bg-green-500/10'}
                    `}
                    onClick={() => setActiveTab(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <TabsContent value="skills" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Skills</h3>
              <div className="space-y-8">
                {getSkillsAsCategories().map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-4">
                    <h3 className="text-lg font-bold text-green-400 border-b border-green-500/30 pb-2">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {category.skills.map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="group relative p-4 rounded-lg border border-green-500/30 hover:border-green-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1 flex flex-col items-center justify-center"
                        >
                          <div className="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10 flex flex-col items-center">
                            {skillLogos[skill] && (
                              <div className="w-6 h-6 relative flex-shrink-0">
                                <Image
                                  src={skillLogos[skill]}
                                  alt={`${skill} logo`}
                                  fill
                                  className="object-contain"
                                  sizes="24px"
                                  style={{ filter: ['ExpressJS', 'Django', 'Flask', 'Vercel', 'Node.js'].includes(skill) ? 'invert(0.6)' : 'none' }}
                                />
                              </div>
                            )}
                            <span className="mt-2 text-green-400">{skill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Timeline</h3>
              {/* Filter Button for Mobile */}
              {isMobile ? (
                <button 
                  onClick={() => setModalOpen(true)} 
                  className="flex items-center gap-2 mb-4 text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-md px-4 py-2 transition-all duration-200 shadow-md"
                >
                  <Filter className="h-5 w-5" />
                  <span>Filter Timeline</span>
                </button>
              ) : (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-green-400" />
                    <span className="text-green-400">Filter Timeline:</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {filterOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleFilter(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 ${
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
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal for Mobile Filters */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
                  <div ref={modalRef} className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-md relative">
                    <h3 className="text-green-400 mb-4 font-bold flex items-center justify-between">
                      <span>Filter Timeline</span>
                      <button 
                        onClick={() => setModalOpen(false)} 
                        className="text-green-400 hover:text-green-300" 
                        aria-label="Close modal"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </h3>
                    <div className="flex flex-col gap-4">
                      {filterOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            toggleFilter(option.id);
                            // setModalOpen(false); // Close modal after selection
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 ${
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
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Items */}
              <div className="relative max-w-5xl mx-auto">
                {isMobile ? (
                  // Mobile Timeline Design
                  <div className="relative pl-8"> {/* Added padding-left for the line */}
                    {/* Vertical Line with segments - Mobile */}
                    <div className="absolute left-2 top-0 bottom-0 w-0.5">
                      <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 via-green-500 to-green-500/20"></div>
                      <div className="absolute h-full w-full">
                        <svg className="h-full w-40 -ml-[76px]" preserveAspectRatio="none" viewBox="0 0 40 100">
                          <path
                            d="M20,0 C20,0 25,20 18,30 C12,40 28,50 20,60 C12,70 25,80 20,100"
                            className="stroke-green-500"
                            fill="none"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Mobile Timeline Items */}
                    <div className="space-y-8">
                      {(([
                        ...personalAchievements.map(achievement => ({
                          type: 'achievement' as const,
                          date: achievement.year,
                          title: achievement.title,
                          subtitle: achievement.description.split('\n')[0],
                          category: achievement.category,
                          icon: iconMap[achievement.icon],
                          targetTab: 'my-achievements',
                          link: achievement.link,
                          linkText: achievement.linkText
                        })),
                        ...experiences.map(exp => ({
                          type: 'experience' as const,
                          title: exp.title,
                          company: exp.company,
                          period: exp.period,
                          description: exp.description,
                          targetTab: 'experience'
                        })),
                        ...education.map(edu => ({
                          type: 'education' as const,
                          degree: edu.degree,
                          institution: edu.institution,
                          year: edu.year,
                          focus: edu.focus,
                          location: edu.location,
                          targetTab: 'education'
                        })),
                        ...freelanceProjects.map(project => ({
                          type: 'freelance' as const,
                          title: project.title,
                          description: project.description,
                          period: project.period,
                          technologies: project.technologies,
                          targetTab: 'freelance'
                        }))
                      ] as const) as TimelineItem[])
                      .filter(item => selectedFilters.has(item.type))
                      .sort((a, b) => {
                        const parseDate = (dateStr: string) => {
                          const firstDate = dateStr.split('-')[0].trim();
                          try {
                            return parse(firstDate, 'MMM. yyyy', new Date());
                          } catch {
                            return new Date(0);
                          }
                        };

                        const getDate = (item: TimelineItem) => {
                          if (item.type === 'achievement') return parseDate(item.date);
                          if (item.type === 'experience') return parseDate(item.period);
                          if (item.type === 'freelance') return parseDate(item.period);
                          return parseDate(item.year);
                        };

                        return getDate(b).getTime() - getDate(a).getTime();
                      })
                      .map((item, index) => (
                        <div key={index} className="relative group">
                          {/* Circle and Horizontal Line */}
                          <div className="absolute left-[-30px] top-4 w-3 h-3 bg-black border-2 border-green-500 rounded-full transform transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:border-green-400"></div>
                          <div className="absolute left-[-16px] top-[21px] w-6 h-0.5 bg-green-500 origin-left transition-all duration-300 ease-in-out group-hover:bg-green-400"></div>

                          {/* Content */}
                          <div className="pl-4 transition-all duration-300 ease-in-out group-hover:translate-x-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-green-300/70 font-mono text-sm transition-colors duration-300 group-hover:text-green-400/90">
                                {item.type === 'achievement' ? item.date 
                                  : item.type === 'experience' ? item.period 
                                  : item.type === 'freelance' ? item.period
                                  : item.year}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded border border-green-500/30 text-green-400/70 bg-green-500/10">
                                {item.type === 'achievement' ? item.category 
                                  : item.type === 'experience' ? 'Professional Experience' 
                                  : item.type === 'freelance' ? 'Freelance Project'
                                  : 'Education'}
                              </span>
                            </div>
                            <button 
                              onClick={() => navigateToTab(item.targetTab)}
                              className="text-left group/title"
                            >
                              <h3 className="text-lg font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300">
                                <span className="group-hover/title:underline decoration-green-500 decoration-2 inline-flex items-center">
                                  {item.type === 'achievement' ? item.title
                                    : item.type === 'experience' ? item.title
                                    : item.type === 'freelance' ? item.title
                                    : item.degree}
                                  {item.type === 'achievement' && item.link && (
                                    <a 
                                      href={item.link}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center ml-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline decoration-yellow-300 decoration-2"
                                      onClick={(e) => e.stopPropagation()}
                                      title={item.linkText || "View Link"}
                                    >
                                      <ExternalLink className="h-5 w-5" />
                                      <span className="ml-1 text-sm">{item.linkText || "View Link"}</span>
                                    </a>
                                  )}
                                </span>
                                <span className="block text-base font-normal text-green-300/80 mt-0.5">
                                  {item.type === 'achievement' ? item.subtitle
                                    : item.type === 'experience' ? item.company
                                    : item.type === 'freelance' ? item.description
                                    : item.institution}
                                </span>
                              </h3>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Desktop Timeline Design
                  <>
                    {/* Main vertical line with segments */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5">
                      <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 via-green-500 to-green-500/20"></div>
                      <div className="absolute h-full w-full">
                        <svg className="h-full w-40 -ml-[76px]" preserveAspectRatio="none" viewBox="0 0 40 100">
                          <path
                            d="M20,0 C20,0 25,20 18,30 C12,40 28,50 20,60 C12,70 25,80 20,100"
                            className="stroke-green-500"
                            fill="none"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-20">
                      {/* Timeline Items - Modified to use filters */}
                      {(([
                        ...personalAchievements.map(achievement => ({
                          type: 'achievement' as const,
                          date: achievement.year,
                          title: achievement.title,
                          subtitle: achievement.description.split('\n')[0],
                          category: achievement.category,
                          icon: iconMap[achievement.icon],
                          targetTab: 'my-achievements',
                          link: achievement.link,
                          linkText: achievement.linkText
                        })),
                        ...experiences.map(exp => ({
                          type: 'experience' as const,
                          title: exp.title,
                          company: exp.company,
                          period: exp.period,
                          description: exp.description,
                          targetTab: 'experience',
                          technologies: exp.technologies
                        })),
                        ...education.map(edu => ({
                          type: 'education' as const,
                          degree: edu.degree,
                          institution: edu.institution,
                          year: edu.year,
                          focus: edu.focus,
                          location: edu.location,
                          targetTab: 'education'
                        })),
                        ...freelanceProjects.map(project => ({
                          type: 'freelance' as const,
                          title: project.title,
                          description: project.description,
                          period: project.period,
                          technologies: project.technologies,
                          targetTab: 'freelance'
                        }))
                      ] as const) as TimelineItem[])
                      .filter(item => selectedFilters.has(item.type)) // Ensure filtering is applied
                      .sort((a, b) => {
                        const parseDate = (dateStr: string) => {
                          const firstDate = dateStr.split('-')[0].trim();
                          try {
                            return parse(firstDate, 'MMM. yyyy', new Date());
                          } catch {
                            return new Date(0);
                          }
                        };

                        const getDate = (item: TimelineItem) => {
                          if (item.type === 'achievement') return parseDate(item.date);
                          if (item.type === 'experience') return parseDate(item.period);
                          if (item.type === 'freelance') return parseDate(item.period);
                          return parseDate(item.year);
                        };

                        return getDate(b).getTime() - getDate(a).getTime();
                      }).map((item, index) => (
                        <div key={index} className={`relative flex w-full items-center min-h-[4rem] group`}>
                          {index % 2 === 1 ? (
                            <>
                              <div className="w-[48%] text-right pr-[15%] transition-all duration-300 ease-in-out group-hover:-translate-x-2">
                                <div className="flex items-center justify-end gap-2 mb-1">
                                  <span className="text-green-300/70 font-mono text-sm transition-colors duration-300 group-hover:text-green-400/90">
                                    {item.type === 'achievement' ? item.date 
                                      : item.type === 'experience' ? item.period 
                                      : item.type === 'freelance' ? item.period
                                      : item.year}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded border border-green-500/30 text-green-400/70 bg-green-500/10">
                                    {item.type === 'achievement' ? item.category 
                                      : item.type === 'experience' ? 'Professional Experience' 
                                      : item.type === 'freelance' ? 'Freelance Project'
                                      : 'Education'}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => navigateToTab(item.targetTab)}
                                  className="text-left group/title"
                                >
                                  <h3 className="text-lg font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300">
                                    <span className="group-hover/title:underline decoration-green-500 decoration-2 inline-flex items-center">
                                      {item.type === 'achievement' ? item.title
                                        : item.type === 'experience' ? item.title
                                        : item.type === 'freelance' ? item.title
                                        : item.degree}
                                      {item.type === 'achievement' && item.link && (
                                        <a 
                                          href={item.link}
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center ml-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline decoration-yellow-300 decoration-2"
                                          onClick={(e) => e.stopPropagation()}
                                          title={item.linkText || "View Link"}
                                        >
                                          <ExternalLink className="h-5 w-5" />
                                          <span className="ml-1 text-sm">{item.linkText || "View Link"}</span>
                                        </a>
                                      )}
                                    </span>
                                    <span className="block text-base font-normal text-green-300/80 mt-0.5">
                                      {item.type === 'achievement' ? item.subtitle
                                        : item.type === 'experience' ? item.company
                                        : item.type === 'freelance' ? item.description
                                        : item.institution}
                                    </span>
                                  </h3>
                                </button>
                              </div>
                              <div className="absolute left-1/2 w-4 h-4 bg-black border-2 border-green-500 rounded-full transform -translate-x-1/2 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:border-green-400 z-10"></div>
                              <div className="absolute left-[38%] top-1/2 h-0.5 bg-green-500 w-[12%] origin-right transition-all duration-300 ease-in-out group-hover:bg-green-400"></div>
                              <div className="w-[48%]"></div>
                            </>
                          ) : (
                            <>
                              <div className="w-[48%]"></div>
                              <div className="absolute left-1/2 w-4 h-4 bg-black border-2 border-green-500 rounded-full transform -translate-x-1/2 transition-transform duration-300 ease-in-out group-hover:scale-125 group-hover:border-green-400 z-10"></div>
                              <div className="absolute left-1/2 top-1/2 h-0.5 bg-green-500 w-[12%] origin-left transition-all duration-300 ease-in-out group-hover:bg-green-400"></div>
                              <div className="w-[48%] pl-[15%] transition-all duration-300 ease-in-out group-hover:translate-x-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-green-300/70 font-mono text-sm transition-colors duration-300 group-hover:text-green-400/90">
                                    {item.type === 'achievement' ? item.date 
                                      : item.type === 'experience' ? item.period 
                                      : item.type === 'freelance' ? item.period
                                      : item.year}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded border border-green-500/30 text-green-400/70 bg-green-500/10">
                                    {item.type === 'achievement' ? item.category 
                                      : item.type === 'experience' ? 'Professional Experience' 
                                      : item.type === 'freelance' ? 'Freelance Project'
                                      : 'Education'}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => navigateToTab(item.targetTab)}
                                  className="text-left group/title"
                                >
                                  <h3 className="text-lg font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300">
                                    <span className="group-hover/title:underline decoration-green-500 decoration-2 inline-flex items-center">
                                      {item.type === 'achievement' ? item.title
                                        : item.type === 'experience' ? item.title
                                        : item.type === 'freelance' ? item.title
                                        : item.degree}
                                      {item.type === 'achievement' && item.link && (
                                        <a 
                                          href={item.link}
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center ml-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline decoration-yellow-300 decoration-2"
                                          onClick={(e) => e.stopPropagation()}
                                          title={item.linkText || "View Link"}
                                        >
                                          <ExternalLink className="h-5 w-5" />
                                          <span className="ml-1 text-sm">{item.linkText || "View Link"}</span>
                                        </a>
                                      )}
                                    </span>
                                    <span className="block text-base font-normal text-green-300/80 mt-0.5">
                                      {item.type === 'achievement' ? item.subtitle
                                        : item.type === 'experience' ? item.company
                                        : item.type === 'freelance' ? item.description
                                        : item.institution}
                                    </span>
                                  </h3>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Professional Experience</h3>
              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <div key={index} className="relative pl-6 pb-2 group hover:translate-x-1 transition-all duration-300 ease-in-out">
                    {/* Green dot and line */}
                    <div className="absolute left-0 top-2 w-3 h-3 bg-green-500 rounded-full group-hover:bg-green-400 transition-colors duration-200"></div>
                    <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-green-500/30 group-hover:bg-green-400/30 transition-colors duration-200"></div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-green-400 leading-tight group-hover:text-green-300 transition-colors duration-200">{exp.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm gap-2 sm:gap-4 mb-3">
                        <span className="text-green-300 font-semibold group-hover:text-green-400 transition-colors duration-200">{exp.company}</span>
                        <span className="hidden sm:block text-green-500/50 group-hover:text-green-400/50 transition-colors duration-200">•</span>
                        <span className="text-green-300/70 font-mono group-hover:text-green-300/90 transition-colors duration-200">{exp.period}</span>
                      </div>

                      {/* Technologies Used Section */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {exp.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="border-green-500 text-green-400 group-hover:border-green-400 group-hover:text-green-300 transition-colors duration-200">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-green-300/90 leading-relaxed">
                        {/* Summary - first line or two */}
                        <p className="pl-4 border-l border-green-500/20 group-hover:border-green-400/30 transition-colors duration-200">
                          {exp.description.split('\n')[0]}
                        </p>
                        
                        {/* Full description with bullet points */}
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedExperiences.has(index) 
                              ? 'max-h-[1000px] opacity-100 mt-2' 
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="space-y-2">
                            {exp.description.split('\n').slice(1).map((paragraph, i) => (
                              <p 
                                key={i} 
                                className="pl-4 border-l border-green-500/20 group-hover:border-green-400/30 transition-colors duration-200"
                                style={{
                                  transform: expandedExperiences.has(index) ? 'translateX(0)' : 'translateX(-10px)',
                                  opacity: expandedExperiences.has(index) ? 1 : 0,
                                  transition: 'all 0.3s ease-in-out',
                                  transitionDelay: `${i * 50}ms`
                                }}
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Learn More button */}
                      <button
                        onClick={() => toggleExperience(index)}
                        className="mt-3 px-3 py-1.5 text-green-400 hover:text-green-300 transition-all duration-200 flex items-center gap-2 text-sm border border-green-500/30 hover:border-green-400 rounded-md bg-green-500/5 hover:bg-green-500/10"
                      >
                        {expandedExperiences.has(index) ? (
                          <>
                            Show Less
                            <ChevronUp size={14} className="transition-transform duration-200" />
                          </>
                        ) : (
                          <>
                            Learn More
                            <ChevronDown size={14} className="transition-transform duration-200" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Education</h3>
              <div className="space-y-8">
                {education.map((edu, index) => (
                  <div key={index} className="relative pl-6 pb-2 group hover:translate-x-1 transition-all duration-300 ease-in-out">
                    {/* Green dot and line */}
                    <div className="absolute left-0 top-2 w-3 h-3 bg-green-500 rounded-full group-hover:bg-green-400 transition-colors duration-200"></div>
                    <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-green-500/30 group-hover:bg-green-400/30 transition-colors duration-200"></div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-green-400 leading-tight group-hover:text-green-300 transition-colors duration-200">{edu.degree}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm gap-2 sm:gap-4 mb-3">
                        <span className="text-green-300 font-semibold group-hover:text-green-400 transition-colors duration-200">{edu.institution}</span>
                        <span className="hidden sm:block text-green-500/50 group-hover:text-green-400/50 transition-colors duration-200">•</span>
                        <span className="text-green-300/70 font-mono group-hover:text-green-300/90 transition-colors duration-200">{edu.year}</span>
                      </div>
                      <div className="text-green-300/90 pl-4 border-l border-green-500/20 group-hover:border-green-400/30 transition-colors duration-200">
                        Focus: {edu.focus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Languages</h3>
              <div className="space-y-6">
                <div className="relative pl-6 pb-2 group hover:translate-x-1 transition-all duration-300 ease-in-out">
                  {/* Green dot and line */}
                  <div className="absolute left-0 top-2 w-3 h-3 bg-green-500 rounded-full group-hover:bg-green-400 transition-colors duration-200"></div>
                  <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-green-500/30 group-hover:bg-green-400/30 transition-colors duration-200"></div>
                  
                  <div className="space-y-4">
                    <div className="pl-4 border-l border-green-500/20 group-hover:border-green-400/30 transition-colors duration-200">
                      <div className="mb-4 hover:translate-x-1 transition-all duration-300 ease-in-out">
                        <h3 className="text-lg font-bold text-green-400 mb-1 group-hover:text-green-300 transition-colors duration-200">English</h3>
                        <p className="text-green-300/90 group-hover:text-green-300/80 transition-colors duration-200">Native Language (IELTS 7.5)</p>
                      </div>
                      <div className="mb-4 hover:translate-x-1 transition-all duration-300 ease-in-out">
                        <h3 className="text-lg font-bold text-green-400 mb-1 group-hover:text-green-300 transition-colors duration-200">Arabic</h3>
                        <p className="text-green-300/90 group-hover:text-green-300/80 transition-colors duration-200">Native Language</p>
                      </div>
                      <div className="hover:translate-x-1 transition-all duration-300 ease-in-out">
                        <h3 className="text-lg font-bold text-green-400 mb-1 group-hover:text-green-300 transition-colors duration-200">Japanese</h3>
                        <p className="text-green-300/90 group-hover:text-green-300/80 transition-colors duration-200">Conversational Level (JLPT N4)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="freelance" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Freelance Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {freelanceProjects.map((project, index) => (
                  <div key={index} className="border border-green-500 rounded-lg p-4 group hover:border-green-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 ease-in-out">
                    <h3 className="text-lg font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors duration-200">{project.title}</h3>
                    
                    {/* Displaying the period in a badge format */}
                    <span className="text-xs text-green-300 border border-green-500/30 rounded-md px-2 py-1 mb-2 inline-block">
                      - {project.period}
                    </span>

                    <p className="text-green-300/90 mb-4 group-hover:text-green-300/80 transition-colors duration-200">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="border-green-500 text-green-400 group-hover:border-green-400 group-hover:text-green-300 transition-colors duration-200">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {/* Code Button */}
                      <Tooltip 
                        text="Sorry, the code is confidential and not public."
                        isTablet={isTablet}
                        isMobile={isMobile}
                        showTooltip={!project.code_available}
                      >
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors duration-200 px-3 py-1 rounded-md ${project.code_available ? '' : 'cursor-not-allowed opacity-50'}`}
                          // style={{ pointerEvents: project.code_available ? 'auto' : 'none' }}
                        >
                          <Github size={16} className="mr-1" />
                          Code
                        </a>
                      </Tooltip>
                      
                      {/* Demo Button */}
                      <Tooltip 
                        text="This project is only available by cloning the GitHub repo and not hosted unfortunately."
                        isMobile={isMobile}
                        isTablet={isTablet}
                        showTooltip={!project.demo_available}
                      >
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors duration-200 px-3 py-1 rounded-md ${project.demo_available ? '' : 'cursor-not-allowed opacity-50'}`}
                          // style={{ pointerEvents: project.demo_available ? 'auto' : 'none' }}
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Check it out!
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="pt-4">
          <Card className="bg-gray-900 border-green-500">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500 pb-2">Courses</h3>
              <div className="space-y-6">
                {/* Note about certifications */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-300">
                    Note: These are courses I&apos;ve taken. For certifications, please visit{" "}
                    <button 
                      onClick={() => navigateToTab('my-achievements')}
                      className="text-yellow-400 hover:text-yellow-300 underline inline-flex items-center"
                    >
                      My Achievements / Publications / Certifications
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </button>{" "}
                  </p>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course, index) => {
                    const { width, height, unoptimized, filterInvert } = providerStyles[course.provider] || providerStyles.default; // Get styles based on provider

                    return (
                      <div 
                        key={index}
                        className="group relative p-4 rounded-lg border border-green-500/30 hover:border-green-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1"
                      >
                        <div className="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-green-400 group-hover:text-green-300 transition-colors duration-200">
                              {course.title}
                            </h3>
                            <Image 
                              src={skillLogos[course.provider]} 
                              alt={`${course.provider} logo`}
                              width={width} 
                              height={height} 
                              unoptimized={unoptimized} // Apply unoptimized prop if defined
                              className={filterInvert ? "filter invert" : ""} // Apply invert filter if defined
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-300/70 group-hover:text-green-300/90 transition-colors duration-200">
                              {course.provider}
                            </span>
                            <span className="text-green-300/70 font-mono group-hover:text-green-300/90 transition-colors duration-200">
                              {course.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

