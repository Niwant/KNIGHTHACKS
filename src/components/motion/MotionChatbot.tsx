"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useMotionStore, motionSelectors } from "@/store/motion-store";
import { BVHLoader } from "three/addons/loaders/BVHLoader.js";
import { retargetMotion } from "@/lib/motion/retargetMotion";
import * as THREE from "three";

// API endpoint for motion generation
const MOTION_API = "https://relaxing-guiding-sailfish.ngrok-free.app/generate-motion";

export const MotionChatbot = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const characters = useMotionStore(motionSelectors.characters);
  const selectedIds = useMotionStore(motionSelectors.selectedIds);
  const setCharacterAnimation = useMotionStore((state) => state.setCharacterAnimation);
  const setPlaying = useMotionStore((state) => state.setPlaying);

  // Derive selected characters from store values
  const selectedCharacters = useMemo(() => {
    return characters.filter((c) => selectedIds.includes(c.id));
  }, [characters, selectedIds]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter a motion description");
      return;
    }

    if (characters.length === 0) {
      setErrorMessage("Please add a character first");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Call motion generation API
      const response = await fetch(MOTION_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.bvh_content) {
        throw new Error("No BVH content in response");
      }

      // Parse BVH motion data
      const loader = new BVHLoader();
      const bvh = loader.parse(data.bvh_content);
      
      // Apply animation to selected characters (or all if none selected)
      const targets = selectedCharacters.length > 0 ? selectedCharacters : characters;
      let appliedCount = 0;

      for (const character of targets) {
        if (!character.rig?.mesh) {
          console.warn(`Character ${character.name} has no rig, skipping`);
          continue;
        }

        // Retarget motion to this character
        const retargetedClip = retargetMotion(
          bvh.skeleton,
          bvh.clip,
          character.rig.mesh
        );

        if (retargetedClip) {
          // Create animation mixer and play
          const mixer = new THREE.AnimationMixer(character.rig.mesh);
          const action = mixer.clipAction(retargetedClip);
          action.play();
          
          setCharacterAnimation(character.id, mixer, retargetedClip);
          appliedCount++;
        }
      }

      if (appliedCount > 0) {
        setSuccessMessage(
          `✅ Motion applied to ${appliedCount} character${appliedCount > 1 ? "s" : ""}`
        );
        setPlaying(true);
      } else {
        setErrorMessage("Failed to apply motion to any characters");
      }
    } catch (error) {
      console.error("Motion generation error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate motion"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-green-400">
            Text to Motion
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Describe the motion you want to generate
          </p>
        </div>

        <Textarea
          placeholder="e.g., a person walking forward slowly, person doing jumping jacks, character waving hello..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-600"
          disabled={isGenerating}
        />

        {errorMessage && (
          <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-400">
            {successMessage}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-600">
            {selectedCharacters.length > 0
              ? `${selectedCharacters.length} character${
                  selectedCharacters.length > 1 ? "s" : ""
                } selected`
              : `${characters.length} character${
                  characters.length === 1 ? "" : "s"
                } in scene`}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || characters.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate Motion"
            )}
          </Button>
        </div>

        <div className="rounded-md border border-dashed border-zinc-800/70 bg-zinc-900/30 p-3 text-xs text-zinc-500">
          <strong>Tips:</strong> Be specific about actions (walking, running, jumping), describe
          speed (slowly, quickly), and include direction if needed (forward, backward, left, right).
        </div>
      </div>
    </Card>
  );
};

