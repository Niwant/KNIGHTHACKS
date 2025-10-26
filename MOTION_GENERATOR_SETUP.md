# Motion Generator Complete Setup Guide

## Files to Copy from `src copy` to `src`

### 1. Retargeting System
```bash
# Copy retargeting files
cp -r "src copy/lib/three/retargeting/" "src/lib/three/retargeting/"
cp "src copy/lib/getSkin.ts" "src/lib/getSkin.ts"
cp "src copy/lib/computeLocalOffsets.ts" "src/lib/computeLocalOffsets.ts"
cp "src copy/lib/mixamo_targets.json" "src/lib/mixamo_targets.json"
```

### 2. Utility Functions
```bash
# Copy Three.js utilities
mkdir -p "src/lib/three/utils"
cp -r "src copy/lib/three/utils/" "src/lib/three/utils/"

# Copy loaders
mkdir -p "src/lib/three/loaders"
cp -r "src copy/lib/three/loaders/" "src/lib/three/loaders/"

# Copy scene setup
mkdir -p "src/lib/three/scene"
cp -r "src copy/lib/three/scene/" "src/lib/three/scene/"
```

### 3. Types
```bash
cp "src copy/types/three.ts" "src/types/three.ts"
```

### 4. Components
```bash
# Copy Canvas component
cp "src copy/components/canvas/Canvas.tsx" "src/components/motion/Canvas.tsx"
cp "src copy/components/canvas/CanvasOverlays.tsx" "src/components/motion/CanvasOverlays.tsx"

# Copy Chatbot with full functionality
cp "src copy/components/Chatbot.tsx" "src/components/motion/Chatbot.tsx"
```

### 5. Character Context
```bash
mkdir -p "src/contexts"
cp "src copy/contexts/CharacterControlsContext.tsx" "src/contexts/CharacterControlsContext.tsx"
```

### 6. Asset Reference Parser
```bash
cp "src copy/lib/assetReference.ts" "src/lib/assetReference.ts"
```

##  Key Features from trial_retargetting:

1. **Complete BVH Loading**: Handles BVH files with proper skeleton extraction
2. **Mixamo Retargeting**: Full retargeting with local offsets and bone mapping  
3. **Multi-Character Support**: Load and animate multiple characters simultaneously
4. **Character Positioning**: Auto-positions characters in a grid layout
5. **Scale Normalization**: Adaptive character scaling based on height
6. **Ground Alignment**: Auto-grounds characters to Y=0
7. **Skeleton Helpers**: Optional skeleton visualization
8. **Export Functions**: Export to GLB with animations and BVH
9. **Audio Sync**: Audio playback synchronized with animations
10. **MaskControl**: Avoidance constraints visualization
11. **Advanced Editing**: Prefix/suffix/in-between motion editing

## API Endpoint
- Generation: `https://relaxing-guiding-sailfish.ngrok-free.app/generate-motion`
- Mesh serving: `https://relaxing-guiding-sailfish.ngrok-free.app/mesh/public/`
- Edit endpoints: prefix, suffix, in-between motion editing

## Architecture Flow

```
Text Prompt → API → BVH File
                      ↓
              BVHLoader.parse()
                      ↓
            Extract skeleton + clip
                      ↓
    Load Character (FBX/GLB) → findPrimaryMixamoRig()
                      ↓
              Normalize Scale
                      ↓
    retargetModel() → computeLocalOffsets()
                      ↓
           SkeletonUtils.retargetClip()
                      ↓
         AnimationMixer + clip.play()
                      ↓
             3D Canvas Render
```

## Next Steps

Run this terminal command to copy all files:

```bash
cd /Users/niwantsalunke/Downloads/UNCC/Projects/knight-hacks

# Create directories
mkdir -p src/lib/three/retargeting src/lib/three/utils src/lib/three/loaders src/lib/three/scene src/types src/contexts

# Copy retargeting
cp -r "src copy/lib/three/retargeting/"* "src/lib/three/retargeting/"
cp "src copy/lib/getSkin.ts" "src/lib/getSkin.ts"
cp "src copy/lib/computeLocalOffsets.ts" "src/lib/computeLocalOffsets.ts"
cp "src copy/lib/mixamo_targets.json" "src/lib/mixamo_targets.json"

# Copy utilities
cp -r "src copy/lib/three/utils/"* "src/lib/three/utils/"
cp -r "src copy/lib/three/loaders/"* "src/lib/three/loaders/"
cp -r "src copy/lib/three/scene/"* "src/lib/three/scene/"

# Copy types and contexts
cp "src copy/types/three.ts" "src/types/three.ts"
cp "src copy/contexts/CharacterControlsContext.tsx" "src/contexts/CharacterControlsContext.tsx"
cp "src copy/lib/assetReference.ts" "src/lib/assetReference.ts"

# Copy Canvas components
cp "src copy/components/canvas/Canvas.tsx" "src/components/motion/Canvas.tsx"
cp "src copy/components/canvas/CanvasOverlays.tsx" "src/components/motion/CanvasOverlays.tsx"
cp "src copy/components/Chatbot.tsx" "src/components/motion/Chatbot.tsx"

echo "✅ All files copied successfully!"
```

Then update the motion-generator page to use the new Canvas component instead of the simple MotionCanvas.

