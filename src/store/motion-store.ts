import { create } from "zustand";
import type { AnimationMixer, AnimationClip, Group, SkinnedMesh, Skeleton, Bone } from "three";

export type Vector3Tuple = [number, number, number];

export interface CharacterRig {
  group: Group;
  mesh: SkinnedMesh;
  skeleton: Skeleton;
  hips: Bone | null;
  armatureRoot: Group | null;
}

export interface MotionCharacter {
  id: string;
  name: string;
  assetPath: string;
  position: Vector3Tuple;
  scale: Vector3Tuple;
  rotation: Vector3Tuple;
  rig?: CharacterRig;
  mixer?: AnimationMixer;
  clip?: AnimationClip;
}

export interface PlayerState {
  isPlaying: boolean;
  speed: number;
}

export interface MotionState {
  characters: MotionCharacter[];
  selectedIds: string[];
  player: PlayerState;
  
  addCharacter: (assetPath: string, name?: string, position?: Vector3Tuple) => string;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<MotionCharacter>) => void;
  setSelected: (ids: string[]) => void;
  toggleSelection: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  registerCharacterRig: (id: string, rig: CharacterRig) => void;
  setCharacterAnimation: (
    id: string,
    mixer?: AnimationMixer,
    clip?: AnimationClip
  ) => void;
  setPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: number) => void;
  stopAllAnimations: () => void;
}

const defaultPosition: Vector3Tuple = [0, 0, 0];
// GLB/FBX models from trial_retargetting are at reasonable scale
const defaultScale: Vector3Tuple = [1, 1, 1];
const defaultRotation: Vector3Tuple = [0, 0, 0];

export const useMotionStore = create<MotionState>((set, get) => ({
  characters: [],
  selectedIds: [],
  player: {
    isPlaying: false,
    speed: 1.0,
  },

  addCharacter: (assetPath, name, position) => {
    const id = crypto.randomUUID();
    const character: MotionCharacter = {
      id,
      name: name || assetPath.split("/").pop() || "Character",
      assetPath,
      position: position || defaultPosition,
      scale: defaultScale,
      rotation: defaultRotation,
    };
    set((state) => ({
      characters: [...state.characters, character],
      selectedIds: [id],
    }));
    return id;
  },

  removeCharacter: (id) => {
    const character = get().characters.find((c) => c.id === id);
    if (character?.mixer) {
      character.mixer.stopAllAction();
    }
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((character) =>
        character.id === id ? { ...character, ...updates } : character
      ),
    })),

  setSelected: (ids) => set({ selectedIds: ids }),

  toggleSelection: (id, additive = false) =>
    set((state) => {
      if (additive) {
        return {
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        };
      }
      return {
        selectedIds: state.selectedIds.includes(id) ? [] : [id],
      };
    }),

  clearSelection: () => set({ selectedIds: [] }),

  registerCharacterRig: (id, rig) =>
    set((state) => ({
      characters: state.characters.map((character) =>
        character.id === id ? { ...character, rig } : character
      ),
    })),

  setCharacterAnimation: (id, mixer, clip) =>
    set((state) => ({
      characters: state.characters.map((character) => {
        if (character.id !== id) return character;
        if (character.mixer && character.mixer !== mixer) {
          character.mixer.stopAllAction();
        }
        return {
          ...character,
          mixer,
          clip,
        };
      }),
    })),

  setPlaying: (isPlaying) =>
    set((state) => ({
      player: { ...state.player, isPlaying },
    })),

  setSpeed: (speed) =>
    set((state) => ({
      player: { ...state.player, speed },
    })),

  stopAllAnimations: () => {
    const { characters } = get();
    characters.forEach((character) => {
      if (character.mixer) {
        character.mixer.stopAllAction();
      }
    });
    set((state) => ({
      player: { ...state.player, isPlaying: false },
    }));
  },
}));

// Selectors
export const motionSelectors = {
  characters: (state: MotionState) => state.characters,
  selectedIds: (state: MotionState) => state.selectedIds,
  player: (state: MotionState) => state.player,
};

