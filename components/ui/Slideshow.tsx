"use client"

import React from 'react';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SlideshowProps {
  images: { src: string; alt: string }[];
  onImageClick: (imageSrc: string) => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ images, onImageClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Create a ref for the timer

  useEffect(() => {
    if (images.length > 1) { // Only set the interval if there are multiple images
      timerRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000); // Change image every 3 seconds
    }

    return () => clearInterval(timerRef.current!);
  }, [images.length]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
    // Restart the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
            index === currentImageIndex ? "translate-x-0" : index < currentImageIndex ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain cursor-pointer"
            priority={index === 0}
            onClick={() => onImageClick(image.src)}
          />
        </div>
      ))}
      {/* Indicator Dots with Background, only show if more than one image */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-800 bg-opacity-70 p-2 rounded-md">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-1 rounded-full ${index === currentImageIndex ? "bg-green-500" : "bg-gray-500"}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slideshow;
