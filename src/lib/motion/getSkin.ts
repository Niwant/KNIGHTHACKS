import * as THREE from "three";

export interface MixamoRigInfo {
  mesh: THREE.SkinnedMesh;
  skeleton: THREE.Skeleton;
  hips: THREE.Bone | null;
  armatureRoot: THREE.Group | null;
}

/**
 * Find the primary Mixamo/SMPL rig in a model
 * Looks for SkinnedMesh with skeleton containing "Hips" bone
 */
export function findPrimaryMixamoRig(root: THREE.Object3D): MixamoRigInfo | null {
  let skinnedMesh: THREE.SkinnedMesh | null = null;
  let armatureRoot: THREE.Group | null = null;

  root.traverse((obj) => {
    if (obj instanceof THREE.SkinnedMesh && obj.skeleton && !skinnedMesh) {
      skinnedMesh = obj;
    }
    if (obj.type === "Group" && obj.name.toLowerCase().includes("armature") && !armatureRoot) {
      armatureRoot = obj as THREE.Group;
    }
  });

  if (!skinnedMesh || !skinnedMesh.skeleton) {
    console.warn("No SkinnedMesh with skeleton found");
    return null;
  }

  // Find the Hips bone (root of Mixamo/SMPL skeleton)
  const hips = skinnedMesh.skeleton.bones.find(
    (bone) =>
      bone.name === "Hips" ||
      bone.name === "mixamorigHips" ||
      bone.name.toLowerCase().includes("hips")
  );

  if (!hips) {
    console.warn("No Hips bone found in skeleton");
  }

  return {
    mesh: skinnedMesh,
    skeleton: skinnedMesh.skeleton,
    hips: hips || null,
    armatureRoot,
  };
}

