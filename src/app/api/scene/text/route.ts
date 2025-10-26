"use server";

import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE_URL =
  "https://untractable-drake-orchestraless.ngrok-free.dev";

const SCENE_API_BASE_URL =
  process.env.SCENE_API_BASE_URL?.trim() || DEFAULT_BASE_URL;

const SCENES_DIR = path.join(process.cwd(), "public", "scenes");

type RemoteSceneResponse = {
  success: boolean;
  message?: string;
  scene_id?: string;
  filename?: string;
  url?: string;
  type?: string;
  prompt?: string;
  resolution?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      return_mesh?: boolean;
      resolution?: number;
    };

    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "Prompt is required." },
        { status: 400 }
      );
    }

    const returnMesh =
      typeof body.return_mesh === "boolean" ? body.return_mesh : true;

    const rawResolution =
      typeof body.resolution === "number" && Number.isFinite(body.resolution)
        ? Math.round(body.resolution)
        : 1600;
    const resolution = Math.min(4096, Math.max(512, rawResolution));

    const remoteResponse = await fetch(
      `${SCENE_API_BASE_URL.replace(/\/$/, "")}/api/generate/text`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          return_mesh: returnMesh,
          resolution,
        }),
        cache: "no-store",
      }
    );

    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      return NextResponse.json(
        {
          success: false,
          message: `Scene service error (${remoteResponse.status}): ${errorText}`,
        },
        { status: remoteResponse.status }
      );
    }

    const remoteData = (await remoteResponse.json()) as RemoteSceneResponse;

    if (!remoteData.success) {
      return NextResponse.json(
        {
          success: false,
          message: remoteData.message ?? "Scene generation failed.",
        },
        { status: 400 }
      );
    }

    const filename =
      remoteData.filename ||
      remoteData.url?.split("/").pop() ||
      `scene_${Date.now()}.glb`;
    const remoteUrl = remoteData.url
      ? new URL(
          remoteData.url,
          SCENE_API_BASE_URL.replace(/\/$/, "")
        ).toString()
      : null;

    if (!remoteUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Scene service did not provide a downloadable URL.",
        },
        { status: 502 }
      );
    }

    const glbResponse = await fetch(remoteUrl, { cache: "no-store" });
    if (!glbResponse.ok) {
      const errorText = await glbResponse.text();
      return NextResponse.json(
        {
          success: false,
          message: `Failed to download generated scene (${glbResponse.status}): ${errorText}`,
        },
        { status: 502 }
      );
    }

    const arrayBuffer = await glbResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const destinationPath = path.join(SCENES_DIR, filename);
    await mkdir(SCENES_DIR, { recursive: true });
    await writeFile(destinationPath, buffer);

    const assetPath = `/scenes/${filename}`;

    return NextResponse.json({
      success: true,
      message: remoteData.message ?? "Scene generated successfully.",
      sceneId: remoteData.scene_id,
      filename,
      assetPath,
      prompt: remoteData.prompt ?? prompt,
      resolution: remoteData.resolution ?? resolution,
      remoteUrl,
      type: remoteData.type ?? (returnMesh ? "mesh" : "splat"),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
