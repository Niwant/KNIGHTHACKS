"use server";

import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE_URL =
  "https://beckett-unaffiliated-unallegorically.ngrok-free.dev";

const ARTIFACT_API_BASE_URL =
  process.env.ARTIFACT_API_BASE_URL?.trim() || DEFAULT_BASE_URL;

const ARTIFACTS_DIR = path.join(process.cwd(), "public", "artifacts");

type ArtifactGenerationPayload = {
  text?: string;
  imageBase64?: string;
  seed?: number;
  octree_resolution?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  face_count?: number;
};

type ArtifactGenerationResponse = {
  success: boolean;
  message: string;
  filename?: string;
  assetPath?: string;
  prompt?: string;
  type?: string;
};

const DEFAULT_PARAMS = {
  seed: 1234,
  octree_resolution: 256,
  num_inference_steps: 40,
  guidance_scale: 5.0,
  face_count: 40000,
} as const;

const ensureUniqueFilename = async (baseDir: string, filename: string) => {
  let candidate = filename;
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  let counter = 1;

  while (true) {
    try {
      await stat(path.join(baseDir, candidate));
      candidate = `${name}_${counter}${ext}`;
      counter += 1;
    } catch {
      return candidate;
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ArtifactGenerationPayload;
    const prompt = body.text?.trim();
    const imageBase64 = body.imageBase64?.trim();

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { success: false, message: "Provide either text or imageBase64." },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      seed: body.seed ?? DEFAULT_PARAMS.seed,
      octree_resolution: body.octree_resolution ?? DEFAULT_PARAMS.octree_resolution,
      num_inference_steps:
        body.num_inference_steps ?? DEFAULT_PARAMS.num_inference_steps,
      guidance_scale: body.guidance_scale ?? DEFAULT_PARAMS.guidance_scale,
      face_count: body.face_count ?? DEFAULT_PARAMS.face_count,
    };

    if (prompt) {
      payload.text = prompt;
    } else if (imageBase64) {
      payload.image = imageBase64;
    }

    const remoteResponse = await fetch(
      `${ARTIFACT_API_BASE_URL.replace(/\/$/, "")}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!remoteResponse.ok) {
      let detail: unknown;
      try {
        detail = await remoteResponse.json();
      } catch {
        detail = await remoteResponse.text();
      }
      return NextResponse.json(
        {
          success: false,
          message: `Artifact service error (${remoteResponse.status}): ${detail}`,
        },
        { status: remoteResponse.status }
      );
    }

    const contentDisposition =
      remoteResponse.headers.get("Content-Disposition") ?? "";
    const contentType = remoteResponse.headers.get("Content-Type") ?? "";

    let remoteFilename = "artifact.obj";
    if (contentDisposition.includes("filename=")) {
      const extracted = contentDisposition
        .split("filename=")
        .pop()
        ?.split(";")[0]
        ?.trim()
        .replace(/^["']|["']$/g, "");
      if (extracted) {
        remoteFilename = extracted;
      }
    } else if (contentType.includes("application/octet-stream")) {
      remoteFilename = `artifact_${Date.now()}.obj`;
    }

    await mkdir(ARTIFACTS_DIR, { recursive: true });
    const uniqueFilename = await ensureUniqueFilename(
      ARTIFACTS_DIR,
      remoteFilename
    );
    const destinationPath = path.join(ARTIFACTS_DIR, uniqueFilename);

    const arrayBuffer = await remoteResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(destinationPath, buffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, message: "Downloaded artifact is empty." },
        { status: 502 }
      );
    }

    const assetPath = `/artifacts/${uniqueFilename}`;

    const responseBody: ArtifactGenerationResponse = {
      success: true,
      message: "Artifact generated successfully.",
      filename: uniqueFilename,
      assetPath,
      prompt,
      type: path.extname(uniqueFilename).replace(".", "") || "obj",
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
