"use client";

import { ChangeEvent, FormEvent, useState } from "react";
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
import {
  generateBlueprintFromImage,
  generateArtifactAssetFromPrompt,
} from "@/lib/artifact-generator";
import { useEditorStore } from "@/store/editor-store";

export const BlueprintGenerator = () => {
  const addBlueprint = useEditorStore((state) => state.addBlueprint);
  const ensureAssetBlueprint = useEditorStore(
    (state) => state.ensureAssetBlueprint
  );
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePromptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      setStatusMessage("Describe what you want to build before generating.");
      return;
    }
    setIsProcessing(true);
    try {
      const { blueprint, meta } = await generateArtifactAssetFromPrompt(trimmed);
      const assetPath = blueprint.assetPath ?? meta.assetPath ?? "";
      if (!assetPath) {
        throw new Error("Artifact asset path missing from generation response.");
      }
      ensureAssetBlueprint({
        name: blueprint.name,
        assetPath,
      });
      setPrompt("");
      setStatusMessage(
        `${meta.message} Saved as ${meta.filename}. Ready in the asset library.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Artifact generation request failed."
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
      const blueprint = await generateBlueprintFromImage(file);
      addBlueprint(blueprint);
      setStatusMessage(`Created “${blueprint.name}” from reference image.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to read the reference image."
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
          Generate Artifact
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
              <Label htmlFor="prompt" className="text-xs uppercase text-zinc-400">
                Describe an artifact
              </Label>
              <Textarea
                id="prompt"
                placeholder="e.g. A matte black torus inspired by sci-fi portal rings"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[110px] bg-zinc-950/50 text-sm"
              />
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full border border-blue-500/50 bg-blue-600 text-blue-50 hover:bg-blue-500"
              >
                {isProcessing ? "Generating..." : "Generate asset"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="image" className="space-y-3">
            <Label htmlFor="reference-image" className="text-xs uppercase text-zinc-400">
              Upload reference
            </Label>
            <Input
              id="reference-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isProcessing}
              className="cursor-pointer bg-zinc-950/50 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              We infer a base primitive and palette from the file name. Drag the
              generated blueprint into the scene to iterate.
            </p>
          </TabsContent>
        </Tabs>
        <Separator className="bg-zinc-800/60" />
        <div className="rounded-md border border-dashed border-zinc-700 bg-zinc-900/40 p-3 text-xs text-zinc-500">
          <p>
            Text prompts call the artifact generation service and download the mesh
            into your `/public/artifacts` folder. Generated assets appear in the
            library so you can drag them into the scene.
          </p>
        </div>
        {statusMessage && (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
            {statusMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
