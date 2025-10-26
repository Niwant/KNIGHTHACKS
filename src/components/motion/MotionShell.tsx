"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CharacterControlsProvider } from "@/contexts/CharacterControlsContext";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChevronDown, Home, Clapperboard, Box } from "lucide-react";

const Canvas = dynamic(() => import("@/components/motion/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 text-sm text-zinc-500">
      Loading motion stage…
    </div>
  ),
});

type MotionShellProps = {
  mixamoCharacters: string[];
};

export const MotionShell = ({ mixamoCharacters }: MotionShellProps) => {
  // Filter out amy.fbx
  const filteredCharacters = mixamoCharacters.filter(
    (char) => !char.toLowerCase().includes("amy.fbx")
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [bvhFile, setBvhFile] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFileReceived = (filename: string) => {
    console.log("📥 BVH file received:", filename);
    setBvhFile(filename);
    setTrigger((prev) => !prev);
  };

  const handleSend = () => {
    console.log("📤 Sending motion generation request");
  };

  const handleAvatarUpdate = () => {
    console.log("🔄 Avatar updated");
    setTrigger((prev) => !prev);
  };

  const toggleCharacter = (characterPath: string) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(characterPath)) {
        return prev.filter((c) => c !== characterPath);
      } else {
        return [...prev, characterPath];
      }
    });
  };

  const clearCharacters = () => {
    setSelectedCharacters([]);
  };

  return (
    <CharacterControlsProvider>
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617)] font-sans text-zinc-100">
        {/* Header - Centered */}
        <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2 transform">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-200"
              >
                ← Back
              </Button>
            </Link>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
                Motion Generator
              </p>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <main className="h-screen w-full">
          <Canvas
            bvhFile={bvhFile}
            trigger={trigger}
            selectedCharacters={selectedCharacters}
            onFileReceived={handleFileReceived}
            onSend={handleSend}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </main>

        {/* Backdrop */}
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

        {/* Left Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-30 flex h-full w-full max-w-[420px] translate-x-0 flex-col border-r border-zinc-800/80 bg-zinc-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-950 to-zinc-900/50 px-6 py-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.6em] text-green-400">
                    Scenergy
                  </p>
                  <h1 className="mt-1 text-lg font-extrabold text-zinc-100">
                    Motion Generator
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-zinc-400">
                AI-Powered Animation Retargeting
              </p>
            </div>
            
            {/* Dropdown Menu Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-all"
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
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                    <div className="p-1.5 bg-gradient-to-b from-zinc-900 to-zinc-950">
                      <Link href="/">
                        <button
                          onClick={() => setIsMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white group"
                        >
                          <Home className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                          <div>
                            <div className="font-semibold text-zinc-100">Home</div>
                            <div className="text-xs text-zinc-500">Back to landing page</div>
                          </div>
                        </button>
                      </Link>
                      
                      <Link href="/scenemaker">
                        <button
                          onClick={() => setIsMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white group"
                        >
                          <Box className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                          <div>
                            <div className="font-semibold text-zinc-100">Scene Maker</div>
                            <div className="text-xs text-zinc-500">Create 3D scenes</div>
                          </div>
                        </button>
                      </Link>
                      
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsSidebarOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white group"
                      >
                        <span className="text-xl font-bold">«</span>
                        <div>
                          <div className="font-semibold text-zinc-100">Collapse Panel</div>
                          <div className="text-xs text-zinc-500">Hide sidebar</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="generate" className="flex h-full flex-col">
              <TabsList className="mx-6 mt-5 grid w-auto grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg">
                <TabsTrigger
                  value="generate"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white font-semibold text-zinc-400 transition-all hover:text-zinc-300 rounded-md"
                >
                  Generate
                </TabsTrigger>
                <TabsTrigger
                  value="characters"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white font-semibold text-zinc-400 transition-all hover:text-zinc-300 rounded-md"
                >
                  Characters
                </TabsTrigger>
                <TabsTrigger
                  value="controls"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-zinc-700 data-[state=active]:to-zinc-800 data-[state=active]:text-white font-semibold text-zinc-400 transition-all hover:text-zinc-300 rounded-md"
                >
                  Controls
                </TabsTrigger>
              </TabsList>

              {/* Generate Tab */}
              <TabsContent
                value="generate"
                className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
              >
                {/* Instructions */}
                <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur hover:bg-zinc-900/60 transition-all">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                      💡 How to use
                    </h3>
                    <ol className="space-y-2 text-xs text-zinc-400">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">1.</span>
                        <span>Select one or more characters from the <strong className="text-zinc-300">Characters</strong> tab</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">2.</span>
                        <span>Use the <strong className="text-zinc-300">Motion AI chatbot</strong> on the right to generate animations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">3.</span>
                        <span>Enter a motion description or upload a BVH file</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">4.</span>
                        <span>Animation will be retargeted to all selected characters</span>
                      </li>
                    </ol>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur hover:bg-zinc-900/60 transition-all">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                      Session Info
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/50 hover:border-green-500/30 transition-colors">
                        <span className="text-zinc-400">Selected Characters</span>
                        <span className="text-lg font-bold text-green-400">{selectedCharacters.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/50 hover:border-green-500/30 transition-colors">
                        <span className="text-zinc-400">Animation Status</span>
                        <span className={bvhFile ? 'text-green-400 font-semibold' : 'text-zinc-500'}>{bvhFile ? 'Loaded' : 'None'}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tips */}
                <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-4 text-xs text-zinc-500">
                  <p className="font-semibold text-zinc-400 mb-2">✨ Tips:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Use natural language to describe movements</li>
                    <li>Upload BVH files for precise control</li>
                    <li>Select multiple characters for batch processing</li>
                  </ul>
                </div>
              </TabsContent>

              {/* Characters Tab */}
              <TabsContent
                value="characters"
                className="flex-1 overflow-y-auto px-6 py-6"
              >
                <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur hover:bg-zinc-900/60 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                          Mixamo Characters
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          Select characters to animate ({selectedCharacters.length}{" "}
                          selected)
                        </p>
                      </div>
                      {selectedCharacters.length > 0 && (
                        <Button
                          onClick={clearCharacters}
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {filteredCharacters.length === 0 ? (
                      <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-6 text-center text-xs text-zinc-500">
                        No FBX files found in /public/mixamo
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px]">
                        <div className="grid grid-cols-2 gap-3 pr-4">
                          {filteredCharacters.map((characterPath) => {
                            const fileName =
                              characterPath
                                .split("/")
                                .pop()
                                ?.replace(".fbx", "") || "";
                            const name = fileName.replace(/_/g, " ");
                            const imagePath = `/mixamo_images/${fileName}.png`;
                            const isSelected = selectedCharacters.includes(characterPath);

                            return (
                              <button
                                key={characterPath}
                                onClick={() => toggleCharacter(characterPath)}
                                className={cn(
                                  "relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all overflow-hidden group",
                                  isSelected
                                    ? "border-green-500/60 bg-green-500/10 text-green-200 shadow-lg shadow-green-500/20"
                                    : "border-zinc-800/70 bg-zinc-900/40 text-zinc-300 hover:border-green-500/40 hover:bg-green-500/5 hover:shadow-md hover:shadow-green-500/10 hover:scale-[1.02]"
                                )}
                              >
                                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-800/60">
                                  <img
                                    src={imagePath}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to emoji if image fails to load
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden absolute inset-0 items-center justify-center text-3xl">
                                    🧑
                                  </div>
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider truncate w-full">
                                  {name}
                                </span>
                                {isSelected && (
                                  <span className="absolute right-2 top-2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Controls Tab */}
              <TabsContent
                value="controls"
                className="flex-1 overflow-y-auto px-6 py-6"
              >
                <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur hover:bg-zinc-900/60 transition-all">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                        Playback Controls
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Timeline and animation controls
                      </p>
                    </div>
                    <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-6 text-center text-xs text-zinc-500">
                      Playback controls will appear here when animation is loaded
                    </div>
                  </div>
                </Card>

                <Card className="mt-6 border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur hover:bg-zinc-900/60 transition-all">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                        Character Display
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Adjust character visualization
                      </p>
                    </div>
                    <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-6 text-center text-xs text-zinc-500">
                      Scale, rotation, and skeleton controls available during animation
                    </div>
                  </div>
                </Card>

                <Card className="mt-6 border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur hover:bg-zinc-900/60 transition-all">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                        Export Options
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Export animated characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-all"
                        disabled
                      >
                        Export as GLB
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-all"
                        disabled
                      >
                        Export BVH
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Generate animation to enable export
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "fixed left-4 top-4 z-10 border-2 border-green-500/50 bg-zinc-900/90 backdrop-blur-xl text-xs font-bold uppercase tracking-[0.35em] text-green-400 shadow-xl transition-all hover:bg-green-500/10 hover:border-green-500 hover:shadow-green-500/20",
            isSidebarOpen ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          Panels
        </Button>
      </div>
    </CharacterControlsProvider>
  );
};

