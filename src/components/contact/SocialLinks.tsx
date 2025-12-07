'use client';

import { Youtube, Instagram } from "lucide-react";

export default function SocialLinks() {
  return (
    <div className="w-full text-center border-t border-gray-600 pt-6 md:pt-8">
      <h3 className="text-[10px] md:text-sm font-semibold mb-6 md:mb-8 tracking-wider">CONTACT US</h3>
      <div className="flex justify-center space-x-3 md:space-x-4">
        <a 
          href="https://www.youtube.com/@howdoyoudo2025" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 md:w-8 md:h-8 bg-transparent border border-gray-500 rounded flex items-center justify-center hover:bg-white hover:text-gray-800 transition-colors"
          aria-label="YouTube"
        >
          <Youtube className="w-3 h-3 md:w-4 md:h-4" />
        </a>
        <a 
          href="#" 
          className="w-7 h-7 md:w-8 md:h-8 bg-transparent border border-gray-500 rounded flex items-center justify-center hover:bg-white hover:text-gray-800 transition-colors"
          aria-label="Instagram"
        >
          <Instagram className="w-3 h-3 md:w-4 md:h-4" />
        </a>
      </div>
    </div>
  );
}