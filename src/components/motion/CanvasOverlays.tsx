import React, { useState, useEffect } from "react";
import Chatbot from "@/components/motion/Chatbot";
import TimelinePanel from "@/components/workspace/TimelinePanel";
import { ChevronDown, Check, Edit3, X } from "lucide-react";
import { Loader3D } from "./Loader3D";

interface CanvasOverlaysProps {
  loadingCharacters: boolean;
  selectedCharacters: string[];
  onFileReceived?: (filename: string) => void;
  onSend?: () => void;
  onAvatarUpdate?: () => void;
  progress?: number;
  duration?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onSeek?: (time: number) => void;
  hasAnimation?: boolean;
  isGenerating?: boolean;
  onGenerateStateChange?: (isGenerating: boolean) => void;
}

type AIModel = {
  id: string;
  name: string;
  description: string;
  available: boolean;
};

const AI_MODELS: AIModel[] = [
  {
    id: "bamm",
    name: "BAMM",
    description: "Body-Aware Motion Model",
    available: true,
  },
  {
    id: "maskcontrol",
    name: "MaskControl",
    description: "MaskControl",
    available: true,
  },
  {
    id: "dancemosaic",
    name: "DanceMosaic",
    description: "Coming soon",
    available: false,
  },
];

export function CanvasOverlays({
  onFileReceived,
  onSend,
  onAvatarUpdate,
  progress = 0,
  duration = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  hasAnimation = false,
  isGenerating = false,
  onGenerateStateChange,
}: CanvasOverlaysProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChatboxCollapsed, setIsChatboxCollapsed] = useState(false);

  // Auto-collapse chatbox after animation is generated
  useEffect(() => {
    if (hasAnimation && duration > 0) {
      setIsChatboxCollapsed(true);
    }
  }, [hasAnimation, duration]);

  return (
    <>
      {/* Loading Overlay - Covers the canvas */}
      {isGenerating && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <Loader3D />
            <div className="text-center">
              <p className="text-lg font-semibold text-zinc-200">
                Generating Animation...
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                This may take a few seconds
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Button - Shows when chatbox is collapsed */}
      {isChatboxCollapsed && (
        <div className="absolute left-1/2 top-6 z-50 -translate-x-1/2 transform">
          <button
            onClick={() => setIsChatboxCollapsed(false)}
            className="group flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/95 px-4 py-2.5 shadow-2xl backdrop-blur-sm transition-all hover:border-green-500/50 hover:bg-zinc-900/95"
          >
            <Edit3 className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-zinc-200">Edit Motion</span>
          </button>
        </div>
      )}

      {/* Centered Top Chatbox */}
      {!isChatboxCollapsed && (
        <div className="absolute left-1/2 top-6 z-50 w-full max-w-2xl -translate-x-1/2 transform px-4">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-zinc-950/40 via-zinc-950/30 to-zinc-950/40">
          {/* Model Selector - Compact Header */}
          <div className="border-b border-zinc-800/60 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                      <span className="text-[10px]">🤖</span>
                    </div>
                    <span className="text-xs font-medium text-zinc-200">{selectedModel.name}</span>
                    {!selectedModel.available && (
                      <span className="text-[10px] text-zinc-500">(Coming soon)</span>
                    )}
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-900 shadow-xl">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            if (model.available) {
                              setSelectedModel(model);
                              setIsDropdownOpen(false);
                            }
                          }}
                          disabled={!model.available}
                          className={`flex w-full items-start gap-3 px-3 py-3 transition-colors hover:bg-zinc-800/50 ${
                            !model.available ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          } ${selectedModel.id === model.id ? 'bg-zinc-800/50' : ''}`}
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-200">{model.name}</span>
                              {!model.available && (
                                <span className="rounded-full bg-zinc-800/70 px-2 py-0.5 text-xs text-zinc-500">
                                  Soon
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-500">{model.description}</p>
                          </div>
                          {selectedModel.id === model.id && (
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Close Button */}
              {hasAnimation && (
                <button
                  onClick={() => setIsChatboxCollapsed(true)}
                  className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
                  aria-label="Close chatbox"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Chatbot Content */}
          {onFileReceived && onSend && onAvatarUpdate && (
            <div className="px-3 py-2.5">
              <Chatbot
                onFileReceived={onFileReceived}
                onSend={onSend}
                onAvatarUpdate={onAvatarUpdate}
                selectedModel={selectedModel.id}
                isGenerating={isGenerating}
                onGeneratingChange={onGenerateStateChange}
              />
            </div>
          )}
        </div>
        </div>
      )}

      {/* Timeline Panel - Floating at bottom */}
      <div className="absolute bottom-6 left-6 right-6 z-50">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/95 shadow-2xl backdrop-blur-sm overflow-hidden">
          <TimelinePanel
            progress={progress}
            duration={duration}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onSeek={onSeek}
            className="border-0 bg-transparent"
          />
        </div>
      </div>
    </>
  );
}