"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useMotionStore, motionSelectors } from "@/store/motion-store";

export const MotionPlayerPanel = () => {
  const player = useMotionStore(motionSelectors.player);
  const characters = useMotionStore(motionSelectors.characters);
  const selectedIds = useMotionStore(motionSelectors.selectedIds);
  
  const setPlaying = useMotionStore((state) => state.setPlaying);
  const setSpeed = useMotionStore((state) => state.setSpeed);
  const stopAllAnimations = useMotionStore((state) => state.stopAllAnimations);
  const removeCharacter = useMotionStore((state) => state.removeCharacter);

  const hasAnimations = characters.some((c) => c.mixer && c.clip);

  return (
    <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-green-400">
            Animation Player
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Control animation playback
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPlaying(!player.isPlaying)}
            disabled={!hasAnimations}
            variant={player.isPlaying ? "default" : "outline"}
            className={
              player.isPlaying
                ? "bg-green-600 hover:bg-green-700"
                : "border-zinc-700 hover:bg-zinc-800"
            }
          >
            {player.isPlaying ? (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </>
            )}
          </Button>
          <Button
            onClick={stopAllAnimations}
            disabled={!hasAnimations}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 6h12v12H6z" />
            </svg>
            Stop
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-zinc-400">
              Playback Speed
            </Label>
            <span className="text-xs font-medium text-zinc-300">
              {player.speed.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[player.speed]}
            onValueChange={(value) => setSpeed(value[0])}
            min={0.1}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>0.1x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Character Management */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-zinc-400">
            Characters in Scene ({characters.length})
          </Label>
          {characters.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500">
              No characters in scene. Add characters from the panel below.
            </div>
          ) : (
            <div className="space-y-2">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    selectedIds.includes(character.id)
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-zinc-800/70 bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/60 text-sm">
                      🧑
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-300">
                        {character.name}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {character.clip ? "Animated" : "Idle"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeCharacter(character.id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

