"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface Loader3DProps {
  className?: string;
}

export function Loader3D({ className }: Loader3DProps) {
  useEffect(() => {
    // Inject CSS animations for the loader
    const style = document.createElement('style');
    style.textContent = `
      @keyframes loader-spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes loader-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .loader-animate-spin-slow {
        animation: loader-spin-slow 3s linear infinite;
      }
      
      .loader-animate-spin {
        animation: loader-spin 1.5s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="relative w-20 h-20">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500/30 rounded-full loader-animate-spin-slow"></div>
        
        {/* Middle rotating ring */}
        <div className="absolute inset-0 m-2 border-3 border-transparent border-r-green-500/40 rounded-full loader-animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 m-4">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
        </div>
      </div>
      
      {/* Glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-2xl"></div>
    </div>
  );
}

