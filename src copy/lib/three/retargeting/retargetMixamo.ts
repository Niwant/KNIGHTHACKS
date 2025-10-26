import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { RetargetResult } from "@/types/three";
import { getTargetSkin } from "../utils/targetSkin";
import { targetToSourceName, mixamoOffsetCache } from "./retargetOptions";
import { findPrimaryMixamoRig } from "@/lib/getSkin";
import { computeLocalOffsets } from "@/lib/computeLocalOffsets";
import mixamo_targets from "@/lib/mixamo_targets.json";

export function retargetMixamoModel(source: any, targetModel: any, characterName: string): RetargetResult | null {
  const targetScene = targetModel.scene || targetModel;
  const rig = findPrimaryMixamoRig(targetScene);
  console.log('Rig:', rig);

  let targetSkin: any = getTargetSkin(targetModel, characterName);
  
  if (!targetSkin) {
    console.warn('No SkinnedMesh found for Mixamo target model');
    return null;
  }

  console.log('Retargeting Mixamo model:', targetModel);
  
  const retargetOptions: any = {
    hip: 'Hips',
    getBoneName: function (bone: any) {
      if (targetModel.scene.userData.modelName == "basic.fbx") {
        return targetToSourceName[bone.name as keyof typeof targetToSourceName] || bone.name;
      }
      return bone.name.replace(/^mixamorig/, '');
    },
    rotationOrder: "ZYX",
    preserveHipPosition: true,
    useTargetMatrix: true,
    scale: targetModel.scene.userData.modelName == "basic.fbx" ? 1 : 100,
  };

  const sourceSkeleton: THREE.Skeleton | undefined = source?.skeleton;

  if (sourceSkeleton && targetSkin?.isSkinnedMesh) {
    const cacheKey = `${characterName || targetSkin.uuid}:${sourceSkeleton.uuid}`;
    let localOffsets = mixamoOffsetCache.get(cacheKey);

    if (!localOffsets || Object.keys(localOffsets).length === 0) {
      localOffsets = computeLocalOffsets(targetSkin, sourceSkeleton, {
        getBoneName: retargetOptions.getBoneName,
        names: retargetOptions.names,
      });

      if (localOffsets && Object.keys(localOffsets).length > 0) {
        mixamoOffsetCache.set(cacheKey, localOffsets);
      }
    }

    if (localOffsets && Object.keys(localOffsets).length > 0) {
      retargetOptions.localOffsets = localOffsets;
    }
  }

  // Debug: Log source skeleton bone names
  console.log('🔍 Source skeleton bones:', source.skeleton.bones.map((b: any) => b.name));
  console.log('🔍 Source clip tracks:', source.clip.tracks.length);
  console.log('🔍 Source clip track names (first 10):', source.clip.tracks.slice(0, 10).map((t: any) => t.name));
  console.log('🔍 Target skin skeleton bones:', targetSkin.skeleton.bones.map((b: any) => b.name).slice(0, 10), '...');
  console.log('🔍 Retarget options:', retargetOptions);
  
  const retargetedClip = SkeletonUtils.retargetClip(targetSkin, source.skeleton, source.clip, retargetOptions);
  console.log('Mixamo retargetedClip:', retargetedClip);
  console.log('Mixamo retargetedClip tracks:', retargetedClip?.tracks.length);

  if (!retargetedClip || retargetedClip.tracks.length === 0) {
    console.error('❌ Mixamo retargeting did not produce animation tracks.');
    console.error('Trying fallback without scale/options...');
    
    // Try fallback retargeting with minimal options
    const fallbackOptions = {
      hip: 'Hips',
      getBoneName: retargetOptions.getBoneName,
    };
    const fallbackClip = SkeletonUtils.retargetClip(targetSkin, source.skeleton, source.clip, fallbackOptions);
    console.log('Fallback clip tracks:', fallbackClip?.tracks.length);
    
    if (fallbackClip && fallbackClip.tracks.length > 0) {
      console.log('✅ Fallback retargeting succeeded!');
      const mixer = new THREE.AnimationMixer(targetSkin);
      mixer.clipAction(fallbackClip).play();
      return { mixer, clip: fallbackClip };
    }
    
    return null;
  }
  
  const FOOT_RX = /Foot$|ToeBase$/i;
  retargetedClip.tracks = retargetedClip.tracks.map(track => {
    if (/\.position\./.test(track.name) && FOOT_RX.test(track.name)) {
      const values = (track as THREE.VectorKeyframeTrack).values.slice();
      for (let i = 1; i < values.length; i += 3) values[i] = 0;
      return new THREE.VectorKeyframeTrack(track.name, (track as any).times, Array.from(values));
    }
    return track;
  });
  
  const mixamoTarget = mixamo_targets.find(target => target.charactername == characterName);
  const baseScale = typeof targetScene.userData?.normalizedScale === "number" ? targetScene.userData.normalizedScale : 1;
  const scaleMultiplier = typeof targetScene.userData?.originalHeight === "number" ? targetScene.userData.originalHeight : 1;

  targetModel.scene.scale.setScalar(targetModel.scene.userData.modelName == "basic.fbx" ? 1 : baseScale/30);
  targetScene.updateMatrixWorld(true);

  const mixamoOffset = mixamoTarget?.yoffset || 0;
  const bbox = new THREE.Box3().setFromObject(targetScene);
  const groundOffset = -bbox.min.y;
  targetScene.userData.groundOffset = groundOffset;
  targetScene.position.y = groundOffset + mixamoOffset;

  const mixer = new THREE.AnimationMixer(targetSkin);
  mixer.clipAction(retargetedClip).play();

  return { mixer, clip: retargetedClip };
}