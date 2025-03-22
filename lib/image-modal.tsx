import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  images: { src: string; alt: string }[];
  setImageSrc: (src: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, onClose, images, setImageSrc }) => {
  if (!isOpen) return null;

  const currentIndex = images.findIndex(image => image.src === imageSrc);

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setImageSrc(images[prevIndex].src);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setImageSrc(images[nextIndex].src);
  };

  const handleDotClick = (index: number) => {
    setImageSrc(images[index].src); // Change the image based on the dot clicked
  };

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
          {/* Navigation Buttons */}
          {images.length > 1 && ( // Only show buttons if there is more than one image
            <>
              <button onClick={handlePrev} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {/* Indicator Dots */}
          {images.length > 1 && ( // Only show dots if there is more than one image
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-800 bg-opacity-70 p-2 rounded-md">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-1 rounded-full ${index === currentIndex ? "bg-green-500" : "bg-gray-500"}`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;