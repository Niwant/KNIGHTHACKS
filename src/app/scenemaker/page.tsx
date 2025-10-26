import { readdir } from "node:fs/promises";
import path from "node:path";
import { EditorShell } from "@/components/editor/EditorShell";

const ARTIFACTS_DIR = path.join(process.cwd(), "public", "artifacts");
const SCENES_DIR = path.join(process.cwd(), "public", "scenes");

async function fetchArtifactFilenames() {
  try {
    const entries = await readdir(ARTIFACTS_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function fetchSceneFilenames() {
  try {
    const entries = await readdir(SCENES_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export default async function SceneMaker() {
  const presetArtifacts = await fetchArtifactFilenames();
  const presetScenes = await fetchSceneFilenames();
  
  return (
    <EditorShell 
      presetArtifacts={presetArtifacts} 
      presetScenes={presetScenes}
    />
  );
}

