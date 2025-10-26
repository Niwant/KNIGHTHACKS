"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BlueprintGenerator } from "@/components/editor/panels/BlueprintGenerator";
import { SceneGenerator } from "@/components/editor/panels/SceneGenerator";
import { ArtifactLibrary } from "@/components/editor/panels/ArtifactLibrary";
import { InspectorPanel } from "@/components/editor/panels/InspectorPanel";
import { PropertiesPanel } from "@/components/editor/panels/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, Home, Clapperboard, Box } from "lucide-react";

const EditorCanvas = dynamic(
  () =>
    import("@/components/editor/canvas/EditorCanvas").then(
      (mod) => mod.EditorCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 text-sm text-zinc-500">
        Initializing renderer…
      </div>
    ),
  }
);

type EditorShellProps = {
  presetArtifacts: string[];
  presetScenes: string[];
};

export const EditorShell = ({
  presetArtifacts,
  presetScenes,
}: EditorShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617)] font-sans text-zinc-100">
      <main className="h-screen w-full">
        <EditorCanvas />
      </main>

      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/50 backdrop-blur transition-opacity duration-300",
          isSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-full w-full max-w-[420px] translate-x-0 flex-col border-r border-zinc-800/80 bg-zinc-950/95 shadow-2xl backdrop-blur-sm transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-5">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.55em] text-blue-400">
              Knight Studio
            </p>
            <h1 className="mt-2 text-lg font-semibold text-zinc-100">
              Procedural Artifact Lab
            </h1>
            <p className="mt-2 text-[0.6rem] uppercase tracking-[0.35em] text-zinc-500">
              Blender workflow · Unity inspector
            </p>
          </div>
          
          {/* Dropdown Menu Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isMenuOpen && "rotate-180")} />
            </Button>
            
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-900 shadow-xl">
                  <div className="p-1">
                    <Link href="/">
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        <Home className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Home</div>
                          <div className="text-xs text-zinc-500">Back to landing</div>
                        </div>
                      </button>
                    </Link>
                    
                    <Link href="/motion-generator">
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        <Clapperboard className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Motion Generator</div>
                          <div className="text-xs text-zinc-500">AI animations</div>
                        </div>
                      </button>
                    </Link>
                    
                    <div className="my-1 h-px bg-zinc-800" />
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSidebarOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <span className="text-lg">«</span>
                      <div>
                        <div className="font-medium">Collapse Panel</div>
                        <div className="text-xs text-zinc-500">Hide sidebar</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="artifacts" className="flex h-full flex-col">
            <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3 bg-zinc-800/70">
              <TabsTrigger
                value="artifacts"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-blue-50"
              >
                Artifacts
              </TabsTrigger>
              <TabsTrigger
                value="scene"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-purple-50"
              >
                Scene
              </TabsTrigger>
              <TabsTrigger
                value="inspector"
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
              >
                Inspector
              </TabsTrigger>
            </TabsList>
            <TabsContent value="artifacts" className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <BlueprintGenerator />
              <ArtifactLibrary presetArtifacts={presetArtifacts} />
            </TabsContent>
            <TabsContent value="scene" className="flex-1 overflow-y-auto px-6 py-6">
              <SceneGenerator presetScenes={presetScenes} />
            </TabsContent>
            <TabsContent value="inspector" className="flex-1 overflow-y-auto px-6 py-6">
              <InspectorPanel />
            </TabsContent>
          </Tabs>
        </div>
      </aside>

      <Button
        variant="outline"
        size="sm"
        className={cn(
          "fixed left-4 top-4 z-10 border-blue-500/40 bg-zinc-900/80 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200 shadow-lg transition-opacity",
          isSidebarOpen ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        Panels
      </Button>

      {/* Properties Panel - Right Side */}
      <aside className="pointer-events-none fixed right-6 top-6 z-10 flex items-start justify-end">
        <div className="pointer-events-auto">
          <PropertiesPanel />
        </div>
      </aside>
    </div>
  );
};
