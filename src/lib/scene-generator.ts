export type SceneGenerationResult = {
  success: true;
  message: string;
  sceneId?: string;
  filename: string;
  assetPath: string;
  prompt: string;
  resolution: number;
  remoteUrl: string;
  type: string;
};

export type SceneGenerationError = {
  success: false;
  message: string;
};

type SceneGenerationResponse = SceneGenerationResult | SceneGenerationError;

export async function generateSceneFromText({
  prompt,
  resolution = 1600,
  returnMesh = true,
}: {
  prompt: string;
  resolution?: number;
  returnMesh?: boolean;
}): Promise<SceneGenerationResult> {
  const response = await fetch("/api/scene/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      resolution,
      return_mesh: returnMesh,
    }),
  });

  let data: SceneGenerationResponse;
  try {
    data = (await response.json()) as SceneGenerationResponse;
  } catch {
    throw new Error("Failed to parse scene generation response.");
  }

  if (!response.ok || !data.success) {
    throw new Error(
      (data as SceneGenerationError)?.message ??
        "Scene generation request failed."
    );
  }

  return data;
}
