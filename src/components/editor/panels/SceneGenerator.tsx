"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateSceneFromText } from "@/lib/scene-generator";
import { useEditorStore } from "@/store/editor-store";

type SceneGeneratorProps = {
  presetScenes?: string[];
};

type SceneEntry = {
  filename: string;
  assetPath: string;
  prompt?: string;
};

export const SceneGenerator = ({ presetScenes = [] }: SceneGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState(1600);
  const [returnMesh, setReturnMesh] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scenes, setScenes] = useState<SceneEntry[]>(
    presetScenes.map((filename) => ({
      filename,
      assetPath: `/scenes/${filename}`,
    }))
  );

  const ensureAssetBlueprint = useEditorStore(
    (state) => state.ensureAssetBlueprint
  );
  const addPlacement = useEditorStore((state) => state.addPlacement);
  const selectPlacement = useEditorStore((state) => state.selectPlacement);

  useEffect(() => {
    if (presetScenes.length === 0) return;
    setScenes((prev) => {
      const existing = new Map(prev.map((item) => [item.filename, item]));
      let updated = false;
      presetScenes.forEach((filename) => {
        if (!existing.has(filename)) {
          updated = true;
          existing.set(filename, {
            filename,
            assetPath: `/scenes/${filename}`,
          });
        }
      });
      return updated ? Array.from(existing.values()) : prev;
    });
  }, [presetScenes]);

  const handleLoadScene = (entry: SceneEntry) => {
    const blueprint = ensureAssetBlueprint({
      name: entry.filename.replace(/\.[^/.]+$/, ""),
      assetPath: entry.assetPath,
    });
    const placement = addPlacement(blueprint.id, [0, 0, 0]);
    if (placement) {
      selectPlacement(placement.id);
      setStatusMessage(`Loaded scene "${entry.filename}" into the stage.`);
    }
  };

  const handlePromptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      setStatusMessage("Describe the scene you want to generate.");
      return;
    }
    setIsProcessing(true);
    try {
      const scene = await generateSceneFromText({
        prompt: trimmed,
        resolution,
        returnMesh,
      });

      setScenes((prev) => {
        const exists = prev.find((item) => item.filename === scene.filename);
        if (exists) {
          return prev.map((item) =>
            item.filename === scene.filename
              ? { ...item, prompt: scene.prompt, assetPath: scene.assetPath }
              : item
          );
        }
        return [
          {
            filename: scene.filename,
            assetPath: scene.assetPath,
            prompt: scene.prompt,
          },
          ...prev,
        ];
      });

      setPrompt("");
      setStatusMessage(
        `${scene.message} Saved as ${scene.filename} (resolution ${scene.resolution}). Load it from the list below when you're ready.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Scene generation request failed."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    try {
      setIsProcessing(true);
      // TODO: Implement image-based scene generation
      setStatusMessage(`Processing scene from: ${file.name}`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to process the reference image."
      );
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/50 text-zinc-200">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400">
          Generate Scene
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="prompt" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/70">
            <TabsTrigger value="prompt" className="data-[state=active]:bg-zinc-700">
              Text prompt
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-zinc-700">
              Reference image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="prompt" className="space-y-3">
            <form className="space-y-3" onSubmit={handlePromptSubmit}>
              <Label htmlFor="scene-prompt" className="text-xs uppercase text-zinc-400">
                Describe a scene
              </Label>
              <Textarea
                id="scene-prompt"
                placeholder="e.g. A futuristic city skyline with neon lights and flying vehicles"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[110px] bg-zinc-950/50 text-sm"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scene-resolution" className="text-xs uppercase text-zinc-400">
                    Resolution (512-4096)
                  </Label>
                  <Input
                    id="scene-resolution"
                    type="number"
                    min={512}
                    max={4096}
                    step={64}
                    value={resolution}
                    onChange={(event) => {
                      const value = parseInt(event.target.value, 10);
                      if (!Number.isNaN(value)) {
                        setResolution(Math.min(4096, Math.max(512, value)));
                      }
                    }}
                    className="bg-zinc-950/50 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-zinc-400">Asset type</Label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={returnMesh}
                      onChange={(event) => setReturnMesh(event.target.checked)}
                      className="h-4 w-4 rounded border border-zinc-600 bg-zinc-900 accent-purple-500"
                    />
                    Return mesh (GLB)
                  </label>
                  <p className="text-[0.7rem] text-zinc-500">
                    Disable to request a Gaussian splat (PLY) when supported.
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full border border-purple-500/50 bg-purple-600 text-purple-50 hover:bg-purple-500"
              >
                {isProcessing ? "Generating..." : "Generate scene"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="image" className="space-y-3">
            <Label htmlFor="scene-reference-image" className="text-xs uppercase text-zinc-400">
              Upload reference
            </Label>
            <Input
              id="scene-reference-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isProcessing}
              className="cursor-pointer bg-zinc-950/50 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              Upload a reference image to generate a complete 3D scene based on
              the composition and elements in the image.
            </p>
          </TabsContent>
        </Tabs>
        <Separator className="bg-zinc-800/60" />
        <div className="rounded-md border border-dashed border-zinc-700 bg-zinc-900/40 p-3 text-xs text-zinc-500">
          <p>
            Scene generation creates complete environments with multiple artifacts,
            lighting, and composition. Use this for building entire worlds quickly.
          </p>
        </div>
        <Separator className="bg-zinc-800/60" />
        <div className="space-y-3">
          <Label className="text-xs uppercase text-zinc-400">Saved Scenes</Label>
          {scenes.length > 0 ? (
            <ScrollArea className="max-h-72 rounded-lg border border-zinc-800/80 bg-zinc-950/40">
              <div className="space-y-2 p-3">
                {scenes.map((scene) => (
                  <div
                    key={scene.filename}
                    className="flex flex-col gap-3 rounded-md border border-zinc-800/70 bg-zinc-900/60 p-3 text-xs uppercase tracking-[0.2em] text-zinc-200 transition hover:border-purple-500/50 hover:bg-purple-500/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-100">
                        {scene.filename}
                      </span>
                      <span className="ml-auto text-[0.6rem] text-zinc-500">
                        {scene.assetPath}
                      </span>
                    </div>
                    {scene.prompt && (
                      <p className="text-[0.6rem] normal-case text-zinc-400">
                        Prompt: {scene.prompt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[0.6rem] normal-case">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-purple-500/40 bg-zinc-900/90 text-purple-200 hover:border-purple-400/60 hover:bg-purple-500/20"
                        onClick={() => handleLoadScene(scene)}
                      >
                        Load in Stage
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        variant="ghost"
                        className="border border-transparent text-zinc-400 hover:text-purple-200"
                      >
                        <a href={scene.assetPath} download>
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-xs text-zinc-500">
              Generated scenes will appear here for later loading.
            </div>
          )}
        </div>
        {statusMessage && (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
            {statusMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
