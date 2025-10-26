"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, ThreeEvent, useThree, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import { Raycaster, Vector2, Plane, Vector3, Box3 } from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import type { Group } from "three";
import { selectors, useEditorStore } from "@/store/editor-store";
import { ArtifactBlueprint, PlacedArtifact } from "@/store/editor-store";

const backgroundColor = "#1a1a1a";
const floorColor = "#0a0a0a";

type ArtifactInstanceProps = {
  blueprint: ArtifactBlueprint;
  placement: PlacedArtifact;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

const FBXContent = ({ assetPath }: { assetPath: string }) => {
  const fbx = useLoader(FBXLoader, assetPath);
  
  // Load FBX at original size - NO normalization (matches trial_retargetting)
  const result = useMemo(() => {
    const cloned = fbx.clone(true);
    cloned.userData.modelName = assetPath.split("/").pop() ?? assetPath;
    cloned.updateMatrixWorld(true);
    return cloned;
  }, [fbx, assetPath]);
  
  return <primitive object={result} />;
};

const GLTFContent = ({
  assetPath,
  normalizeHeight,
}: {
  assetPath: string;
  normalizeHeight?: number;
}) => {
  const { scene } = useGLTF(assetPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const target = cloned;
    if (!target) return;
    target.updateMatrixWorld(true);
    let box = new Box3().setFromObject(target);

    if (normalizeHeight) {
      const currentHeight = box.max.y - box.min.y;
      if (Number.isFinite(currentHeight) && currentHeight > 0) {
        const scaleFactor = normalizeHeight / currentHeight;
        target.scale.multiplyScalar(scaleFactor);
        target.updateMatrixWorld(true);
        box = new Box3().setFromObject(target);
      }
    }

    if (Number.isFinite(box.min.y) && Number.isFinite(box.max.y)) {
      const groundOffset = -box.min.y;
      if (groundOffset !== 0) {
        target.position.setY(target.position.y + groundOffset);
        target.updateMatrixWorld(true);
      }
    }
  }, [cloned, normalizeHeight]);

  return <primitive object={cloned} />;
};

const OBJContent = ({ assetPath }: { assetPath: string }) => {
  const obj = useLoader(OBJLoader, assetPath);
  const cloned = useMemo(() => obj.clone(true), [obj]);

  useEffect(() => {
    const target = cloned;
    if (!target) return;
    target.updateMatrixWorld(true);
    const box = new Box3().setFromObject(target);
    if (!Number.isFinite(box.min.y) || !Number.isFinite(box.max.y)) {
      return;
    }
    const groundOffset = -box.min.y;
    if (groundOffset !== 0) {
      target.position.setY(target.position.y + groundOffset);
      target.updateMatrixWorld(true);
    }
  }, [cloned]);

  return <primitive object={cloned} />;
};

const AssetContent = ({ assetPath }: { assetPath: string }) => {
  const lowerPath = assetPath.toLowerCase();
  const isMixamoCharacter = lowerPath.includes("/characters/");

  if (lowerPath.endsWith(".fbx")) {
    return <FBXContent assetPath={assetPath} />;
  }
  if (lowerPath.endsWith(".obj")) {
    return <OBJContent assetPath={assetPath} />;
  }
  if (lowerPath.endsWith(".glb") || lowerPath.endsWith(".gltf")) {
    return (
      <GLTFContent
        assetPath={assetPath}
        normalizeHeight={isMixamoCharacter ? 2 : undefined}
      />
    );
  }
  return <GLTFContent assetPath={assetPath} />;
};

const ArtifactInstance = ({
  blueprint,
  placement,
  isSelected,
  onSelect,
}: ArtifactInstanceProps) => {
  const groupRef = useRef<Group>(null);

  const geometry = useMemo(() => {
    switch (blueprint.shape) {
      case "sphere":
        return <sphereGeometry args={[0.75, 48, 48]} />;
      case "cone":
        return <coneGeometry args={[0.7, 1.6, 32]} />;
      case "torus":
        return <torusGeometry args={[0.8, 0.25, 24, 72]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.6, 0.6, 1.5, 48]} />;
      case "cube":
      default:
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    }
  }, [blueprint.shape]);

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(placement.id);
  };

  return (
    <group
      ref={groupRef}
      position={placement.position}
      scale={placement.scale}
      rotation={placement.rotation}
      onPointerDown={handleSelect}
    >
      {blueprint.kind === "asset" && blueprint.assetPath ? (
        <Suspense fallback={null}>
          <AssetContent assetPath={blueprint.assetPath} />
        </Suspense>
      ) : (
        <mesh castShadow receiveShadow>
          {geometry}
          <meshStandardMaterial
            color={blueprint.color}
            roughness={0.45}
            metalness={0.35}
            emissive={isSelected ? "#1d4ed8" : blueprint.color}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>
      )}
    </group>
  );
};

const SceneDropZone = () => {
  const addPlacement = useEditorStore((state) => state.addPlacement);
  const { camera, gl } = useThree();

  useEffect(() => {
    const target = gl.domElement;
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const plane = new Plane(new Vector3(0, 1, 0), 0);
    const intersection = new Vector3();

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = "copy";
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const blueprintId = event.dataTransfer?.getData("application/x-blueprint");
      if (!blueprintId) return;
      const bounds = target.getBoundingClientRect();
      ndc.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      ndc.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      // Project 2D drop coordinates onto the ground plane to determine spawn position.
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.ray.intersectPlane(plane, intersection.clone());
      if (!hit) return;
      const blueprint = useEditorStore
        .getState()
        .blueprints.find((item) => item.id === blueprintId);
      const spawnHeight = blueprint?.kind === "asset" ? 0 : 0.75;
      addPlacement(blueprintId, [hit.x, spawnHeight, hit.z]);
    };

    target.addEventListener("dragover", handleDragOver);
    target.addEventListener("drop", handleDrop);

    return () => {
      target.removeEventListener("dragover", handleDragOver);
      target.removeEventListener("drop", handleDrop);
    };
  }, [addPlacement, camera, gl]);

  return null;
};

export const EditorCanvas = () => {
  const placements = useEditorStore(selectors.placements);
  const blueprints = useEditorStore(selectors.blueprints);
  const selectedId = useEditorStore(selectors.selectedPlacementId);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const selectPlacement = useEditorStore((state) => state.selectPlacement);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      <Canvas
        shadows
        camera={{ position: [5, 4, 6], fov: 45, near: 0.1, far: 2000 }}
        dpr={[1, 2]}
        onPointerMissed={(event) => {
          if (event.button === 0) {
            clearSelection();
          }
        }}
      >
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[backgroundColor, 50, 200]} />
        
        {/* Studio lighting setup */}
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.6} args={["#606060", "#404040"]} />
        
        {/* Key light */}
        <directionalLight
          position={[5, 10, 7]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        
        {/* Fill light */}
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        
        {/* Rim light */}
        <directionalLight position={[0, 3, -8]} intensity={0.6} />

        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.15}
          enableZoom={true}
          minDistance={0.0001}
          maxDistance={Number.POSITIVE_INFINITY}
          enablePan={true}
          enableDamping={true}
          dampingFactor={0.08}
        />

        <SceneDropZone />

        <group position={[0, 0, 0]}>
          <mesh
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            scale={[10000, 10000, 1]}
            onPointerDown={(event) => {
              event.stopPropagation();
              clearSelection();
            }}
          >
            <planeGeometry args={[1, 1, 1, 1]} />
            <meshStandardMaterial
              color={floorColor}
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          <gridHelper args={[100, 100, "#444444", "#333333"]} />
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            width={120}
            height={120}
            blur={2}
            far={60}
          />
        </group>

        {placements.map((placement) => {
          const blueprint = blueprints.find(
            (item) => item.id === placement.blueprintId
          );
          if (!blueprint) {
            return null;
          }
          return (
            <ArtifactInstance
              key={placement.id}
              blueprint={blueprint}
              placement={placement}
              isSelected={placement.id === selectedId}
              onSelect={selectPlacement}
            />
          );
        })}
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
        <span className="drop-shadow-lg">Drag blueprints into the workspace</span>
        <span className="drop-shadow-lg">Click to select · Right click + drag to orbit</span>
      </div>
      {selectedId && (
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl px-4 py-2.5 text-xs font-semibold text-blue-200 shadow-xl">
          Use the Properties Panel on the right to adjust position and scale →
        </div>
      )}
    </div>
  );
};
