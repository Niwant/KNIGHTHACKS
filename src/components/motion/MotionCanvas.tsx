"use client";

import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import { Vector3, Plane, Group } from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { motionSelectors, useMotionStore } from "@/store/motion-store";
import { findPrimaryMixamoRig } from "@/lib/motion/getSkin";

const backgroundColor = "#10121a";

const FBXContent = ({ assetPath }: { assetPath: string }) => {
  const fbx = useLoader(FBXLoader, assetPath);
  const cloned = useMemo(() => {
    const clone = fbx.clone(true);
    clone.userData.modelName = assetPath.split("/").pop() ?? assetPath;
    clone.updateMatrixWorld(true);
    return clone;
  }, [fbx, assetPath]);
  return <primitive object={cloned} />;
};

const GLBContent = ({ assetPath }: { assetPath: string }) => {
  const { scene } = useGLTF(assetPath);
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.userData.modelName = assetPath.split("/").pop() ?? assetPath;
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene, assetPath]);
  return <primitive object={cloned} />;
};

const CharacterContent = ({ assetPath }: { assetPath: string }) => {
  const lower = assetPath.toLowerCase();
  if (lower.endsWith(".fbx")) {
    return <FBXContent assetPath={assetPath} />;
  }
  return <GLBContent assetPath={assetPath} />;
};

const CharacterInstance = ({
  id,
  assetPath,
  position,
  scale,
  rotation,
  isSelected,
}: {
  id: string;
  assetPath: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
}) => {
  const groupRef = useRef<Group>(null);
  const updateCharacter = useMotionStore((state) => state.updateCharacter);
  const setSelected = useMotionStore((state) => state.setSelected);
  const toggleSelection = useMotionStore((state) => state.toggleSelection);
  const registerCharacterRig = useMotionStore((state) => state.registerCharacterRig);
  
  const dragState = useRef<{
    plane: Plane;
    y: number;
    pointerId: number | null;
    dragging: boolean;
  }>({
    plane: new Plane(new Vector3(0, 1, 0), 0),
    y: position[1],
    pointerId: null,
    dragging: false,
  });
  const intersection = useRef(new Vector3());

  useEffect(() => {
    let cancelled = false;
    const attempt = () => {
      if (cancelled || !groupRef.current) return;
      const group = groupRef.current;
      const modelName = assetPath.split("/").pop();
      if (modelName) {
        group.userData.modelName = modelName;
      }
      const rigInfo = findPrimaryMixamoRig(group);
      if (rigInfo) {
        registerCharacterRig(id, {
          group,
          mesh: rigInfo.mesh,
          skeleton: rigInfo.skeleton,
          hips: rigInfo.hips,
          armatureRoot: rigInfo.armatureRoot,
        });
      } else {
        requestAnimationFrame(attempt);
      }
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [assetPath, id, registerCharacterRig]);

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        const additive =
          event.nativeEvent.shiftKey ||
          event.nativeEvent.ctrlKey ||
          event.nativeEvent.metaKey;
        if (additive) {
          toggleSelection(id, true);
        } else {
          setSelected([id]);
        }
        if (event.button !== 0) return;
        dragState.current.y = position[1];
        dragState.current.plane.set(new Vector3(0, 1, 0), -dragState.current.y);
        dragState.current.pointerId = event.pointerId;
        dragState.current.dragging = true;
        event.stopPropagation();
      }}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        if (
          !dragState.current.dragging ||
          dragState.current.pointerId !== event.pointerId
        ) {
          return;
        }
        const hit = event.ray.intersectPlane(
          dragState.current.plane,
          intersection.current
        );
        if (!hit) return;
        updateCharacter(id, { position: [hit.x, dragState.current.y, hit.z] });
        event.stopPropagation();
      }}
      onPointerUp={(event: ThreeEvent<PointerEvent>) => {
        if (dragState.current.pointerId !== event.pointerId) return;
        dragState.current.dragging = false;
        dragState.current.pointerId = null;
        event.stopPropagation();
      }}
      onPointerLeave={(event: ThreeEvent<PointerEvent>) => {
        if (dragState.current.pointerId !== event.pointerId) return;
        dragState.current.dragging = false;
        dragState.current.pointerId = null;
      }}
      onPointerCancel={(event: ThreeEvent<PointerEvent>) => {
        if (dragState.current.pointerId !== event.pointerId) return;
        dragState.current.dragging = false;
        dragState.current.pointerId = null;
      }}
    >
      <Suspense fallback={null}>
        <CharacterContent assetPath={assetPath} />
      </Suspense>
      {isSelected && (
        <mesh>
          <boxGeometry args={[2.2, 3.5, 2.2]} />
          <meshBasicMaterial
            color="#10b981"
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      )}
    </group>
  );
};

const GroundPlane = () => {
  const clearSelection = useMotionStore((state) => state.clearSelection);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={(event) => {
        event.stopPropagation();
        clearSelection();
      }}
    >
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
};

const MotionFrameUpdater = () => {
  const characters = useMotionStore(motionSelectors.characters);
  const player = useMotionStore(motionSelectors.player);
  useFrame((_, delta) => {
    if (!player.isPlaying) return;
    const scaled = delta * player.speed;
    characters.forEach((character) => {
      character.mixer?.update(scaled);
    });
  });
  return null;
};

export const MotionCanvas = () => {
  const characters = useMotionStore(motionSelectors.characters);
  const selectedIds = useMotionStore(motionSelectors.selectedIds);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <Canvas
        shadows
        camera={{ position: [8, 6, 10], fov: 45, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.1}
          minDistance={0.5}
          maxDistance={500}
          enableDamping
          dampingFactor={0.08}
        />

        <gridHelper args={[200, 200, "#1f2937", "#1f2937"]} />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.6}
          width={20}
          height={20}
          blur={1.8}
          far={25}
        />

        <GroundPlane />
        <MotionFrameUpdater />

        {characters.map((character) => (
          <CharacterInstance
            key={character.id}
            id={character.id}
            assetPath={character.assetPath}
            position={character.position}
            scale={character.scale}
            rotation={character.rotation}
            isSelected={selectedIds.includes(character.id)}
          />
        ))}
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
        Drag characters to reposition · Scroll to zoom
      </div>
    </div>
  );
};

