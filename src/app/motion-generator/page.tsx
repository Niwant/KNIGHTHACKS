import { readdir } from "node:fs/promises";
import path from "node:path";
import { MotionShell } from "@/components/motion/MotionShell";

const MIXAMO_DIR = path.join(process.cwd(), "public", "mixamo");

async function fetchMixamoCharacters() {
  try {
    const entries = await readdir(MIXAMO_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".fbx"))
      .map((entry) => `/mixamo/${entry.name}`)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export default async function MotionGenerator() {
  const mixamoCharacters = await fetchMixamoCharacters();

  return <MotionShell mixamoCharacters={mixamoCharacters} />;
}
