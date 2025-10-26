"use client";

import { create } from "zustand";
import { Vector3Tuple } from "three";

export type ArtifactShape = "cube" | "sphere" | "cone" | "torus" | "cylinder";

export type ArtifactBlueprint = {
  id: string;
  name: string;
  shape: ArtifactShape;
  color: string;
  origin: "text" | "image" | "asset";
  kind: "primitive" | "asset";
  prompt?: string;
  imagePreview?: string;
  assetPath?: string;
};

export type PlacedArtifact = {
  id: string;
  blueprintId: string;
  position: Vector3Tuple;
  scale: Vector3Tuple;
  rotation: Vector3Tuple;
};

type EditorMode = "translate" | "scale";

type EditorState = {
  blueprints: ArtifactBlueprint[];
  placements: PlacedArtifact[];
  mode: EditorMode;
  selectedPlacementId: string | null;
  addBlueprint: (blueprint: Omit<ArtifactBlueprint, "id">) => ArtifactBlueprint;
  updateBlueprint: (id: string, payload: Partial<ArtifactBlueprint>) => void;
  addPlacement: (
    blueprintId: string,
    position: Vector3Tuple,
    scale?: Vector3Tuple
  ) => PlacedArtifact | null;
  updatePlacement: (
    placementId: string,
    payload: Partial<PlacedArtifact>
  ) => void;
  removePlacement: (placementId: string) => void;
  selectPlacement: (placementId: string | null) => void;
  setMode: (mode: EditorMode) => void;
  clearSelection: () => void;
  ensureAssetBlueprint: (payload: { name: string; assetPath: string }) => ArtifactBlueprint;
};

const defaultPrimitiveScale: Vector3Tuple = [1, 1, 1];
// Mixamo FBX models are ~147 units tall, so scale to ~2 units (0.01355)
const defaultAssetScale: Vector3Tuple = [1, 1, 1];
const defaultRotation: Vector3Tuple = [0, 0, 0];

export const useEditorStore = create<EditorState>((set, get) => ({
  blueprints: [],
  placements: [],
  selectedPlacementId: null,
  mode: "translate",
  addBlueprint: (blueprint) => {
    const entry: ArtifactBlueprint = {
      ...blueprint,
      id: crypto.randomUUID(),
    };
    set((state) => ({
      blueprints: [...state.blueprints, entry],
    }));
    return entry;
  },
  updateBlueprint: (id, payload) =>
    set((state) => ({
      blueprints: state.blueprints.map((item) =>
        item.id === id ? { ...item, ...payload } : item
      ),
    })),
  addPlacement: (blueprintId, position, scaleArg) => {
    const blueprint = get().blueprints.find((item) => item.id === blueprintId);
    if (!blueprint) {
      return null;
    }
    const placementScale = scaleArg
      ? ([...scaleArg] as Vector3Tuple)
      : (blueprint.kind === "asset"
          ? ([...defaultAssetScale] as Vector3Tuple)
          : ([...defaultPrimitiveScale] as Vector3Tuple));

    const placement: PlacedArtifact = {
      id: crypto.randomUUID(),
      blueprintId,
      position,
      scale: placementScale,
      rotation: defaultRotation,
    };
    set((state) => ({
      placements: [...state.placements, placement],
      selectedPlacementId: placement.id,
    }));
    return placement;
  },
  updatePlacement: (placementId, payload) =>
    set((state) => ({
      placements: state.placements.map((item) =>
        item.id === placementId ? { ...item, ...payload } : item
      ),
    })),
  removePlacement: (placementId) =>
    set((state) => ({
      placements: state.placements.filter((item) => item.id !== placementId),
      selectedPlacementId:
        state.selectedPlacementId === placementId
          ? null
          : state.selectedPlacementId,
    })),
  selectPlacement: (placementId) =>
    set(() => ({
      selectedPlacementId: placementId,
    })),
  setMode: (mode) =>
    set(() => ({
      mode,
    })),
  clearSelection: () =>
    set(() => ({
      selectedPlacementId: null,
    })),
  ensureAssetBlueprint: ({ name, assetPath }) => {
    const existing = get().blueprints.find(
      (item) => item.assetPath === assetPath && item.kind === "asset"
    );
    if (existing) {
      return existing;
    }
    const entry: ArtifactBlueprint = {
      id: crypto.randomUUID(),
      name,
      shape: "cube",
      color: "#94a3b8",
      origin: "asset",
      kind: "asset",
      assetPath,
    };
    set((state) => ({
      blueprints: [...state.blueprints, entry],
    }));
    return entry;
  },
}));

export const selectors = {
  blueprints: (state: EditorState) => state.blueprints,
  placements: (state: EditorState) => state.placements,
  selectedPlacementId: (state: EditorState) => state.selectedPlacementId,
  mode: (state: EditorState) => state.mode,
};
