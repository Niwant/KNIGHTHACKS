"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { InteractiveBackground } from "@/components/landing/InteractiveBackground";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-sans text-zinc-900 overflow-hidden">
      {/* Three.js Interactive Background */}
      <InteractiveBackground />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-purple-400/15 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-7xl space-y-20">
          {/* Header */}
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-blue-500 bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
              </span>
              Knight Hacks 2025
            </div>
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl lg:text-8xl drop-shadow-sm">
              Scenergy
            </h1>
            <p className="mt-6 text-2xl text-zinc-700 sm:text-3xl font-light">
              AI-Powered 3D Scene Creation & Character Animation
            </p>
            <p className="mt-4 text-lg text-zinc-600 sm:text-xl">
              Create stunning 3D worlds and animate characters with the power of AI
            </p>
          </div>

          {/* Feature Cards */}
          <div className={`grid gap-6 md:grid-cols-2 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Scene Maker Card */}
            <Link href="/scenemaker" className="group">
              <Card className="relative h-full overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-10 shadow-lg transition-all duration-500 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="relative flex flex-col items-start space-y-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-blue-500/60">
                    <svg
                      className="h-10 w-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-4xl font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        Scene Maker
                      </h2>
                      <p className="mt-2 text-sm font-bold text-blue-600 uppercase tracking-widest">
                        PRODUCTION READY
                      </p>
                    </div>
                    <p className="text-lg text-zinc-700 leading-relaxed">
                      Create procedural 3D scenes with AI-generated artifacts. Build, arrange, and export stunning 3D environments with professional-grade tools.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-zinc-600">
                      <li className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        AI-powered procedural artifact generation
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Text & image-based scene creation
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Real-time 3D canvas with precision controls
                      </li>
                    </ul>
                  </div>
                  
                  <Button className="group/btn w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all">
                    <span className="font-semibold">Launch Scene Maker</span>
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Motion Generator Card */}
            <Link href="/motion-generator" className="group">
              <Card className="relative h-full overflow-hidden border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white p-10 shadow-lg transition-all duration-500 hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-200 hover:-translate-y-1">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="relative flex flex-col items-start space-y-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-rose-600 to-pink-700 shadow-xl shadow-pink-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-pink-500/60">
                    <svg
                      className="h-10 w-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-extrabold text-zinc-900 group-hover:text-pink-600 transition-colors">
                        Motion Generator
                      </h2>
                      <span className="rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-600 border-2 border-pink-300 bg-pink-50">
                        NEW
                      </span>
                    </div>
                    <p className="text-lg text-zinc-700 leading-relaxed">
                      Animate 3D characters with AI-powered motion generation. Upload audio or text to create lifelike character animations instantly.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-zinc-600">
                      <li className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100">
                          <svg className="h-3 w-3 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Audio-driven character animation
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                          <svg className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Mixamo character retargeting
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100">
                          <svg className="h-3 w-3 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Real-time preview & GLB export
                      </li>
                    </ul>
                  </div>
                  
                  <Button className="group/btn w-full bg-gradient-to-r from-pink-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 transition-all">
                    <span className="font-semibold">Launch Motion Generator</span>
                    <svg
                      className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </Card>
            </Link>
          </div>

          {/* Footer Info */}
          <div className={`text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-sm text-zinc-600">
              Built for Knight Hacks 2025 · Powered by Next.js, Three.js & AI
            </p>
            <div className="mt-6 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>3D Scenes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>AI Motion</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Production Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
