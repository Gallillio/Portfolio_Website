import { useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

interface ThankYouPopupProps {
  onClose: () => void
}

export default function ThankYouPopup({ onClose }: ThankYouPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="relative bg-gray-900 border border-green-500 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out animate-in fade-in-0 zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-green-400 mb-2">Message Sent!</h3>
          <p className="text-green-300/90">
            Thank you for your message. I will get back to you soon.
          </p>
        </div>
      </div>
    </div>
  )
} 