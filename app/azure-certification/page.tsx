"use client"

import { useEffect } from 'react'

export default function AzureCertificationPage() {
  // Function to close the current tab
  const handleClose = () => {
    window.close()
  }

  // Add title to the page
  useEffect(() => {
    document.title = "Azure Certification - Work in Progress"
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-green-400 p-4 font-mono">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-3xl font-bold mb-6">
          Azure AI Engineer Associate Certification
        </h1>
        
        <div className="border-2 border-green-500 rounded-lg p-6 bg-black">
          <div className="mb-4 text-yellow-400 text-xl">
            <span className="animate-pulse">⚠️</span> CERTIFICATION STATUS: IN PROGRESS <span className="animate-pulse">⚠️</span>
          </div>
          
          <p className="text-lg mb-4">
            I&apos;m currently studying for this certification and plan to take the exam in April 2025!
          </p>
          
          <div className="space-y-4 text-left mb-6">
            <p className="border-l-2 border-green-500 pl-4 py-1">
              <span className="text-green-400">$</span> Running training_program.sh...
            </p>
            <p className="border-l-2 border-green-500 pl-4 py-1">
              <span className="text-green-400">$</span> Loading Azure modules... [████████░░] 80%
            </p>
            <p className="border-l-2 border-green-500 pl-4 py-1">
              <span className="text-green-400">$</span> Brain capacity: [███████░░░] 70% full
            </p>
            <p className="border-l-2 border-green-500 pl-4 py-1">
              <span className="text-green-400">$</span> Caffeine levels: [██████████] 100%
            </p>
            <p className="border-l-2 border-green-500 pl-4 py-1">
              <span className="text-green-400">$</span> Certification completion: ETA April 2025
            </p>
          </div>
          
          <p className="text-green-300 italic mb-6">
            &ldquo;Why did the developer go broke? Because he used up all his cache on Azure services!&rdquo;
          </p>
          
          <button
            onClick={handleClose}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-md transition-colors duration-300 mx-auto block"
          >
            Click here to exit
          </button>
        </div>
        
        <p className="text-sm text-green-500/60 mt-8">
          This page will self-destruct in 5... just kidding. But feel free to close it!
        </p>
      </div>
    </div>
  )
} 