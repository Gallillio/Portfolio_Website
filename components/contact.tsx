"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react"
import { useAchievements } from "@/lib/achievements-context"
import { links } from "@/lib/profile-data"
import { useForm, ValidationError } from '@formspree/react'
import ThankYouPopup from "./thank-you-popup"

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [state, handleSubmit] = useForm("mrbpbjaa")
  const { sendContact, visitTab, downloadCV } = useAchievements()
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("contact")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSubmit(e)
    
    // Unlock the contact achievement
    sendContact()
    
    // Reset form
    setFormState({
      name: "",
      email: "",
      subject: "",
      message: "",
    })

    // Show thank you popup
    setShowThankYou(true)
  }

  return (
    <>
      <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono">
        <h2 className="text-2xl mb-6 border-b border-green-500 pb-2">Contact Me</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400">Send a Message</CardTitle>
                <CardDescription className="text-green-300/70">
                  Fill out the form below to get in touch with me.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-green-400 mb-1">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="bg-black border-green-500 text-green-300"
                      />
                      <ValidationError 
                        prefix="Name" 
                        field="name"
                        errors={state.errors}
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-green-400 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="bg-black border-green-500 text-green-300"
                      />
                      <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-green-400 mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      required
                      className="bg-black border-green-500 text-green-300"
                    />
                    <ValidationError 
                      prefix="Subject" 
                      field="subject"
                      errors={state.errors}
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-green-400 mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="bg-black border-green-500 text-green-300 resize-none custom-scrollbar"
                    />
                    <ValidationError 
                      prefix="Message" 
                      field="message"
                      errors={state.errors}
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={state.submitting} 
                    className="bg-green-500 text-black hover:bg-green-600"
                  >
                    {state.submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gray-900 border-green-500 mb-6">
              <CardHeader>
                <CardTitle className="text-green-400">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 text-green-400" size={20} />
                  <a href="mailto:ahmedgalal11045@gmail.com" className="text-green-300 hover:text-green-400">
                    AhmedGalal11045@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-green-400" size={20} />
                  <span className="text-green-300">+20 1110333933</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 text-green-400" size={20} />
                  <span className="text-green-300">New Cairo, Egypt</span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                    asChild
                  >
                    <a 
                      href="/Ahmed Elzeky Resume.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download
                      onClick={() => downloadCV()}
                    >
                      Download CV
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-400">Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    title="GitHub"
                    className="border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                    asChild
                  >
                    <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <Github size={20} />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="LinkedIn"
                    className="border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                    asChild
                  >
                    <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <Linkedin size={20} />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Credly"
                    className="border-green-500 text-green-400 bg-black hover:bg-green-500/20"
                    asChild
                  >
                    <a href={links.credly} target="_blank" rel="noopener noreferrer" aria-label="Credly">
                      {/* Icon source: Icons8 - https://img.icons8.com */}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 100 100" 
                        fill="none"
                        className="text-green-500"
                      >
                        <path 
                          d="M50 95C74.8528 95 95 74.8528 95 50C95 25.1472 74.8528 5 50 5C25.1472 5 5 25.1472 5 50C5 74.8528 25.1472 95 50 95Z" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          d="M66.6665 33.3335L43.9998 56.0002L33.3332 45.3335" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showThankYou && (
        <ThankYouPopup onClose={() => setShowThankYou(false)} />
      )}
    </>
  )
}

