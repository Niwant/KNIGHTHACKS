"use client";

import { ArtifactBlueprint, ArtifactShape } from "@/store/editor-store";

const SHAPES: ArtifactShape[] = ["cube", "sphere", "cone", "torus", "cylinder"];

const shapeMatchers: Record<ArtifactShape, RegExp[]> = {
  cube: [/cube/, /box/, /block/, /square/],
  sphere: [/sphere/, /ball/, /orb/, /planet/, /round/],
  cone: [/cone/, /pyramid/, /spike/, /triangular/],
  torus: [/torus/, /donut/, /ring/, /loop/],
  cylinder: [/cylinder/, /tube/, /pillar/, /drum/],
};

const colorPalette = [
  { name: "electric", value: "#4F46E5", matches: [/blue/, /violet/, /electric/] },
  { name: "sunset", value: "#F97316", matches: [/orange/, /sun/, /warm/] },
  { name: "mint", value: "#10B981", matches: [/green/, /mint/, /forest/] },
  { name: "ruby", value: "#EF4444", matches: [/red/, /ruby/, /crimson/] },
  { name: "gold", value: "#FACC15", matches: [/gold/, /yellow/, /bright/] },
  { name: "slate", value: "#64748B", matches: [/gray/, /steel/, /metal/] },
  { name: "magenta", value: "#DB2777", matches: [/pink/, /magenta/, /rose/] },
];

const defaultColor = colorPalette[0].value;

let promptCounter = 0;
let imageCounter = 0;

const normalizePrompt = (input: string) => input.toLowerCase().trim();

const matchShape = (prompt: string): ArtifactShape => {
  const normalized = normalizePrompt(prompt);
  for (const [shape, matchers] of Object.entries(shapeMatchers)) {
    if (matchers.some((regex) => regex.test(normalized))) {
      return shape as ArtifactShape;
    }
  }
  // fallback deterministic but varied
  const fallbackIndex = Math.abs(hashString(normalized)) % SHAPES.length;
  return SHAPES[fallbackIndex];
};

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const matchColor = (prompt: string) => {
  const normalized = normalizePrompt(prompt);
  for (const palette of colorPalette) {
    if (palette.matches.some((regex) => regex.test(normalized))) {
      return palette.value;
    }
  }
  const fallbackIndex =
    Math.abs(hashString(normalized) + Date.now()) % colorPalette.length;
  return colorPalette[fallbackIndex]?.value ?? defaultColor;
};

export const generateBlueprintFromPrompt = (
  prompt: string
): Omit<ArtifactBlueprint, "id"> => {
  promptCounter += 1;
  const cleanedPrompt = prompt.trim();
  const shape = matchShape(cleanedPrompt);
  const color = matchColor(cleanedPrompt);
  return {
    name:
      cleanedPrompt.length > 0
        ? cleanedPrompt
        : `Prompt Artifact ${promptCounter}`,
    shape,
    color,
    kind: "primitive",
    origin: "text",
    prompt: cleanedPrompt,
  };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const generateBlueprintFromImage = async (
  file: File
): Promise<Omit<ArtifactBlueprint, "id">> => {
  imageCounter += 1;
  const imagePreview = await readFileAsDataUrl(file);
  const filename = file.name.replace(/\.[^/.]+$/, "");
  const shape = matchShape(filename);
  const color = colorPalette[imageCounter % colorPalette.length]?.value ?? defaultColor;
  return {
    name: filename || `Image Artifact ${imageCounter}`,
    shape,
    color,
    kind: "primitive",
    origin: "image",
    imagePreview,
  };
};

type ArtifactGenerationResult = {
  success: true;
  message: string;
  filename: string;
  assetPath: string;
  prompt?: string;
  type?: string;
};

type ArtifactGenerationError = {
  success: false;
  message: string;
};

type ArtifactGenerationResponse =
  | ArtifactGenerationResult
  | ArtifactGenerationError;

export async function generateArtifactAssetFromPrompt(
  prompt: string,
  options?: {
    seed?: number;
    octreeResolution?: number;
    numInferenceSteps?: number;
    guidanceScale?: number;
    faceCount?: number;
  }
): Promise<{ blueprint: Omit<ArtifactBlueprint, "id">; meta: ArtifactGenerationResult }> {
  const response = await fetch("/api/artifacts/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: prompt,
      seed: options?.seed,
      octree_resolution: options?.octreeResolution,
      num_inference_steps: options?.numInferenceSteps,
      guidance_scale: options?.guidanceScale,
      face_count: options?.faceCount,
    }),
  });

  let data: ArtifactGenerationResponse;
  try {
    data = (await response.json()) as ArtifactGenerationResponse;
  } catch {
    throw new Error("Failed to parse artifact generation response.");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      (data as ArtifactGenerationError)?.message ??
        "Artifact generation failed."
    );
  }

  const blueprint: Omit<ArtifactBlueprint, "id"> = {
    name: data.filename.replace(/\.[^/.]+$/, ""),
    shape: "cube",
    color: "#94a3b8",
    kind: "asset",
    origin: "text",
    prompt,
    assetPath: data.assetPath,
  };

  return { blueprint, meta: data };
}
