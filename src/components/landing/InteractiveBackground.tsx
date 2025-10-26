"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const waveRef = useRef<any>(null);
  const starsRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create wave geometry
    const geometry = new THREE.PlaneGeometry(20, 20, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color("#3b82f6") },
        uColor2: { value: new THREE.Color("#ec4899") },
        uColor3: { value: new THREE.Color("#a855f7") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vPosition = position;
          vUv = uv;
          
          vec3 pos = position;
          
          // Wave effect based on time
          pos.z += sin((pos.x + uTime * 0.5) * 0.5) * 0.3;
          pos.z += sin((pos.y + uTime * 0.3) * 0.5) * 0.3;
          pos.z += sin((pos.x + pos.y + uTime * 0.4) * 0.4) * 0.2;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          
          // Create colorful gradient
          vec3 color1 = uColor1;
          vec3 color2 = uColor2;
          vec3 color3 = uColor3;
          
          // Mix colors based on position
          vec3 color = mix(color1, color2, uv.y);
          color = mix(color, color3, uv.x * 0.5);
          
          // Add brightness variation
          float brightness = 0.6 + sin(vPosition.x * 2.0) * 0.1;
          color *= brightness;
          
          gl_FragColor = vec4(color, 0.15);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const wave = new THREE.Mesh(geometry, material);
    wave.rotation.x = -Math.PI / 2;
    scene.add(wave);
    waveRef.current = wave;

    // Create stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 300;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    const color1 = new THREE.Color("#3b82f6"); // blue
    const color2 = new THREE.Color("#ec4899"); // pink
    const color3 = new THREE.Color("#a855f7"); // purple
    const color4 = new THREE.Color("#ffffff"); // white
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      
      // Position stars closer to camera and in a visible range
      positions[i3] = (Math.random() - 0.5) * 10; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 10; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 10; // z
      
      // Random colors
      const randomColor = Math.random();
      let color;
      if (randomColor < 0.25) color = color1;
      else if (randomColor < 0.5) color = color2;
      else if (randomColor < 0.75) color = color3;
      else color = color4;
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      size: 0.15,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      if (!waveRef.current || !sceneRef.current || !camera || !rendererRef.current) return;
      
      const elapsedTime = clock.getElapsedTime();
      
      // Update uniforms for wave
      waveRef.current.material.uniforms.uTime.value = elapsedTime;
      
      // Animate stars with automatic motion
      if (starsRef.current) {
        // Gentle floating motion
        starsRef.current.position.x = Math.sin(elapsedTime * 0.3) * 2;
        starsRef.current.position.y = Math.cos(elapsedTime * 0.4) * 2;
        
        // Smooth rotation
        starsRef.current.rotation.y += 0.0005;
        starsRef.current.rotation.x += 0.0003;
        starsRef.current.rotation.z += 0.0002;
        
        // Make stars twinkle by adjusting opacity
        const opacity = 0.7 + Math.sin(elapsedTime * 0.5) * 0.3;
        starsRef.current.material.opacity = opacity;
      }
      
      rendererRef.current.render(sceneRef.current, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      rendererRef.current?.dispose();
      waveRef.current?.geometry.dispose();
      if (waveRef.current?.material instanceof THREE.ShaderMaterial) {
        waveRef.current.material.dispose();
      }
      starsRef.current?.geometry.dispose();
      starsRef.current?.material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

