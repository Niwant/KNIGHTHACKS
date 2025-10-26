import * as THREE from "three";

export function setupSkyAndClouds(scene: THREE.Scene) {
  // Dark background - no sky or clouds for studio look - brighter for better visibility
  scene.background = new THREE.Color(0x3a3a3a);
  scene.fog = new THREE.Fog(0x3a3a3a, 50, 200);
}

export function setupGround(scene: THREE.Scene) {
  // Create grid helper for visible grid lines - brighter for better visibility
  const gridHelper = new THREE.GridHelper(100, 100, 0x666666, 0x444444);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // Add a large dark plane as base - brighter for better visibility
  const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01; // Slightly below grid to avoid z-fighting
  ground.receiveShadow = true;
  scene.add(ground);
}

export function setupLighting(scene: THREE.Scene) {
  // Ambient light for overall illumination - increased brightness
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // Hemisphere light for soft top/bottom lighting - increased brightness
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x808080, 1.0);
  scene.add(hemisphereLight);

  // Main directional light (key light) - increased intensity
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -15;
  directionalLight.shadow.camera.right = 15;
  directionalLight.shadow.camera.top = 15;
  directionalLight.shadow.camera.bottom = -15;
  scene.add(directionalLight);

  // Fill light (softer, from opposite side) - increased intensity
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // Rim light (back light for character definition) - increased intensity
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
  rimLight.position.set(0, 3, -8);
  scene.add(rimLight);

  // Additional side lights for better visibility
  const sideLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
  sideLight1.position.set(8, 8, 0);
  scene.add(sideLight1);

  const sideLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  sideLight2.position.set(-8, 8, 0);
  scene.add(sideLight2);

  // Top light for even illumination
  const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
  topLight.position.set(0, 15, 0);
  scene.add(topLight);
}