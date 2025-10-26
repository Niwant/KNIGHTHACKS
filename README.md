## Knight Studio – Procedural Artifact Lab

A Three.js-powered scene editor inspired by Blender and Unity. Describe an artifact with text or drop in a reference image to synthesize a primitive blueprint, then drag that blueprint into the stage and iterate on its transform with familiar translate/scale handles.

Built with **Next.js App Router**, **React Three Fiber**, **drei**, **Zustand**, and **shadcn/ui**.

## Features

- Text prompt and image-based artifact generation with palette heuristics.
- Drag-and-drop asset library that feeds directly into the viewport.
- One-click spawning of bundled GLB presets from `/public/artifacts`.
- Orbit, translate, and scale controls with grounded placement and contact shadows.
- Unity-style inspector with axis sliders, mode toggles, and reset controls.
- Blender-inspired dark UI built from shadcn/ui components.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Workflow

1. **Generate blueprints**  
   - Use the **Text prompt** tab to describe an artifact (“matte black torus portal”).  
   - Or upload a **Reference image**; the filename seeds the primitive + color.

2. **Populate the scene**  
   - Click any preset GLB entry to load it instantly from `/public/artifacts`.  
   - Drag any blueprint card into the viewport to spawn it where you drop.  
   - Double-click a blueprint to spawn it at the origin; the library tracks in-scene counts.

3. **Manipulate artifacts**  
   - Click an artifact to focus it, then switch between **Translate** and **Scale** modes in the inspector.  
   - Position sliders (X/Z) and scale sliders (X/Y/Z) offer precise adjustments while keeping assets grounded.  
   - Use **Reset transform** or **Remove from scene** to quickly iterate.

## Tech Stack

- Next.js 15 (App Router, TypeScript, Tailwind CSS v4)
- React Three Fiber / drei / Three.js
- Zustand state management
- shadcn/ui component system

## Scripts

- `npm run dev` – start the development server.
- `npm run build` – create an optimized production build.
- `npm run start` – run the production server.
- `npm run lint` – lint the project.

## Docker Deployment

This application can be deployed to Vultr Cloud (or any Docker-compatible platform) using Docker.

### Quick Deploy

```bash
# Build Docker image
./scripts/build-docker.sh

# Run locally to test
docker run -p 3000:3000 knight-hacks:latest

# Deploy to Vultr (set VULTR_SERVER_IP environment variable)
./scripts/deploy-vultr.sh
```

### Docker Compose

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
