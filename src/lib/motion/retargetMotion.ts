/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

/**
 * Retarget motion from BVH to GLB/SMPL character
 * Based on trial_retargetting implementation
 */
export function retargetMotion(
  sourceSkeleton: THREE.Skeleton,
  sourceClip: THREE.AnimationClip,
  targetMesh: THREE.SkinnedMesh
): THREE.AnimationClip | null {
  if (!targetMesh.isSkinnedMesh || !targetMesh.skeleton) {
    console.error("Target must be a SkinnedMesh with skeleton");
    return null;
  }

  console.log("🎯 Retargeting motion:");
  console.log("  Source bones:", sourceSkeleton.bones.length);
  console.log("  Target bones:", targetMesh.skeleton.bones.length);
  console.log("  Clip duration:", sourceClip.duration.toFixed(2), "seconds");

  // Retargeting options for Mixamo/SMPL characters
  const retargetOptions: any = {
    hip: "Hips", // Root bone name
    // Strip "mixamorig" prefix if present
    getBoneName: (bone: THREE.Bone) => {
      return bone.name.replace(/^mixamorig/, "");
    },
  };

  try {
    const retargetedClip = SkeletonUtils.retargetClip(
      targetMesh,
      sourceSkeleton,
      sourceClip,
      retargetOptions
    );

    if (!retargetedClip || retargetedClip.tracks.length === 0) {
      console.error("❌ Retargeting produced no tracks");
      return null;
    }

    console.log("✅ Retargeting succeeded:", retargetedClip.tracks.length, "tracks");
    return retargetedClip;
  } catch (error) {
    console.error("❌ Retargeting failed:", error);
    return null;
  }
}

