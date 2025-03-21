import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-gray-900/95 rounded-md max-w-[90%] max-h-[90vh] md:max-w-[85%] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '100%' }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-black/50 px-4 py-2 border-b border-green-500/50 rounded-t-md">
          <div className="flex space-x-2">
            {/* Close Button */}
            <button 
              className="w-3 h-3 rounded-full bg-red-500 border border-red-600 hover:bg-red-600 transition-colors"
              onClick={onClose}
              aria-label="Close"
            ></button>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600"></div>
          </div>
          <button 
            className="text-green-500 hover:text-green-400 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative p-4 border border-green-500/20 rounded-b-md">
          <div className="relative flex items-center justify-center">
            <img
              style={{ maxWidth: '80%' }}
              src={imageSrc}
              alt="Expanded view"
              className="max-w-full max-h-[70vh] object-contain rounded-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;