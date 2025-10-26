"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMotionStore } from "@/store/motion-store";

type MotionCharactersPanelProps = {
  mixamoCharacters: string[];
};

// Icon mapping for character types
const getCharacterIcon = (filename: string): string => {
  const lower = filename.toLowerCase();
  if (lower.includes("female") || lower.includes("woman") || lower.includes("girl")) return "👩";
  if (lower.includes("male") || lower.includes("man") || lower.includes("boy")) return "👨";
  if (lower.includes("robot") || lower.includes("mech")) return "🤖";
  if (lower.includes("zombie") || lower.includes("monster")) return "🧟";
  if (lower.includes("soldier") || lower.includes("warrior")) return "⚔️";
  return "🧑";
};

export const MotionCharactersPanel = ({ mixamoCharacters }: MotionCharactersPanelProps) => {
  const [customPath, setCustomPath] = useState("");
  const addCharacter = useMotionStore((state) => state.addCharacter);

  // Convert mixamo filenames to character objects
  const characters = useMemo(() => {
    return mixamoCharacters.map((filename) => {
      const nameWithoutExt = filename.replace(/\.fbx$/i, "");
      return {
        id: filename,
        name: nameWithoutExt.replace(/_/g, " "),
        path: `/mixamo/${filename}`,
        icon: getCharacterIcon(filename),
      };
    });
  }, [mixamoCharacters]);

  const handleAddAvatar = (character: typeof characters[0]) => {
    addCharacter(character.path, character.name);
  };

  const handleAddCustom = () => {
    if (!customPath.trim()) return;
    const name = customPath.split("/").pop() || "Custom Character";
    addCharacter(customPath.trim(), name);
    setCustomPath("");
  };

  return (
    <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-green-400">
            Characters
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Add avatars to the scene
          </p>
        </div>

        {/* Character Grid */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-zinc-400">
            Mixamo Characters ({characters.length})
          </Label>
          {characters.length === 0 ? (
            <div className="mt-3 rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-6 text-center text-xs text-zinc-500">
              No FBX files found in /public/mixamo
            </div>
          ) : (
            <ScrollArea className="mt-3 h-[250px]">
              <div className="grid grid-cols-2 gap-3">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => handleAddAvatar(character)}
                    className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4 text-center transition hover:border-green-500/40 hover:bg-green-500/5"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/60 text-3xl">
                      {character.icon}
                    </div>
                    <span className="text-xs font-medium text-zinc-300 truncate w-full">
                      {character.name}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Custom FBX/GLB Input */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-zinc-400">
            Custom Character Path
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="/mixamo/character.fbx"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCustom();
                }
              }}
              className="h-9 border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-600"
            />
            <Button
              onClick={handleAddCustom}
              disabled={!customPath.trim()}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-zinc-600">
            Enter a path to an FBX or GLB file (e.g., /mixamo/character.fbx)
          </p>
        </div>

        {/* Info */}
        <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-3 text-xs text-zinc-500">
          <strong>Note:</strong> Characters should be in FBX or GLB format with SMPL/Mixamo skeleton
          for proper motion retargeting. Place files in <code className="text-green-400">/public/mixamo/</code>
        </div>
      </div>
    </Card>
  );
};

