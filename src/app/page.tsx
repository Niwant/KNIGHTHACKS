"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617)] font-sans text-zinc-100">
      {/* Hero Section */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-6xl space-y-16">
          {/* Header */}
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Knight Hacks 2025
            </div>
            <h1 className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              Knight Studio
            </h1>
            <p className="mt-6 text-xl text-zinc-400 sm:text-2xl">
              Procedural 3D scene creation & AI-powered motion generation
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Scene Maker Card */}
            <Link href="/scenemaker" className="group">
              <Card className="h-full border-zinc-800/70 bg-zinc-900/50 p-8 backdrop-blur transition-all duration-300 hover:border-blue-500/50 hover:bg-zinc-900/70 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="flex flex-col items-start space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50 transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="h-8 w-8 text-white"
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
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-zinc-100">
                      Scene Maker
                    </h2>
                    <p className="mt-3 text-zinc-400">
                      Create procedural 3D scenes with AI-generated artifacts.
                      Build, arrange, and export stunning 3D environments.
                    </p>
                    <ul className="mt-6 space-y-2 text-sm text-zinc-500">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">✓</span>
                        Procedural artifact generation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">✓</span>
                        Text & image-based scene creation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">✓</span>
                        Real-time 3D canvas with precision controls
                      </li>
                    </ul>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Launch Scene Maker
                    <svg
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Motion Generator Card */}
            <Link href="/motion-generator" className="group">
              <Card className="h-full border-zinc-800/70 bg-zinc-900/50 p-8 backdrop-blur transition-all duration-300 hover:border-green-500/50 hover:bg-zinc-900/70 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="flex flex-col items-start space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50 transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-zinc-100">
                        Motion Generator
                      </h2>
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-300">
                        Coming Soon
                      </span>
                    </div>
                    <p className="mt-3 text-zinc-400">
                      Animate 3D characters with AI-powered motion generation.
                      Text-to-motion, video upload, and Mixamo integration.
                    </p>
                    <ul className="mt-6 space-y-2 text-sm text-zinc-500">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">○</span>
                        Text & video-based motion generation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">○</span>
                        Mixamo character & animation retargeting
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">○</span>
                        Real-time animation preview & export
                      </li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-green-600/50 bg-green-500/10 hover:bg-green-500/20"
                  >
                    View Preview
                    <svg
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </Card>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <p className="text-sm text-zinc-600">
              Built for Knight Hacks 2025 · Powered by Next.js, Three.js & AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
