import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BackgroundAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubesRef = useRef<THREE.Mesh[]>([]);
  const velocitiesRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const timeRef = useRef<number>(0);
  const boundingSpheresRef = useRef<THREE.Sphere[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Add maximum speed constant
    const MAX_SPEED = 0.02; // Maximum speed for any direction

    // Helper function to limit velocity
    const limitVelocity = (velocity: { x: number; y: number; z: number }) => {
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
      if (speed > MAX_SPEED) {
        const scale = MAX_SPEED / speed;
        velocity.x *= scale;
        velocity.y *= scale;
        velocity.z *= scale;
      }
    };

    // Setup
    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const fov = 75;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 8;
    cameraRef.current = camera;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add point lights for more subtle lighting
    const pointLight1 = new THREE.PointLight(0x0072ff, 1.5, 20); // Reduced intensity, increased distance
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8159ff, 1.5, 20); // Reduced intensity, increased distance
    pointLight2.position.set(5, -3, 5);
    scene.add(pointLight2);

    // Create a subtle fog
    scene.fog = new THREE.FogExp2(0x090d19, 0.03);

    // Create cubes with modern materials
    const geometryOptions = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.IcosahedronGeometry(0.8, 0),
      new THREE.OctahedronGeometry(0.8),
      new THREE.TetrahedronGeometry(0.9)
    ];

    // Modern tech-inspired colors
    const colors = [
      0x0072ff, // Blue
      0x8159ff, // Purple
      0x2dd4bf, // Teal
      0x0ea5e9, // Light blue
      0x8b5cf6, // Violet
      0x3b82f6, // Blue
      0x0284c7, // Dark blue
      0x2563eb, // Royal blue
      0x7c3aed, // Purple
      0x6366f1  // Indigo
    ];

    for (let i = 0; i < 15; i++) {
      // Randomly select a geometry
      const geometry = geometryOptions[Math.floor(Math.random() * geometryOptions.length)];
      
      // Create glassy material
      const material = new THREE.MeshPhysicalMaterial({ 
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.6,
        metalness: 0.2,
        roughness: 0.25,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        wireframe: Math.random() > 0.9, // Reduce wireframe probability
      });
      
      const cube = new THREE.Mesh(geometry, material);
      
      // Random size
      const scale = 0.5 + Math.random() * 0.7;
      cube.scale.set(scale, scale, scale);
      
      // Random initial position (wider spread)
      cube.position.x = (Math.random() - 0.5) * 16;
      cube.position.y = (Math.random() - 0.5) * 16;
      cube.position.z = (Math.random() - 0.5) * 16;
      
      // Create a bounding sphere for collision detection
      // Size the bounding sphere based on the object's scale
      const boundingSphere = new THREE.Sphere(
        cube.position.clone(),
        scale * 0.8 // Slightly smaller than the visual size for better visual collisions
      );
      boundingSpheresRef.current.push(boundingSphere);
      
      // Random initial velocity (much slower)
      velocitiesRef.current.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.006,
        z: (Math.random() - 0.5) * 0.006
      });

      scene.add(cube);
      cubesRef.current.push(cube);
    }

    // Animation
    const animate = (time: number) => {
      timeRef.current = time * 0.001; // Convert to seconds
      requestAnimationFrame(animate);

      // Slowly rotate camera
      const cameraRadius = 10;
      const cameraSpeed = 0.02; // Reduced from 0.05 to 0.02
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(timeRef.current * cameraSpeed) * cameraRadius;
        cameraRef.current.position.z = Math.cos(timeRef.current * cameraSpeed) * cameraRadius;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // First, update positions
      cubesRef.current.forEach((cube, index) => {
        const velocity = velocitiesRef.current[index];
        
        // Update position
        cube.position.x += velocity.x;
        cube.position.y += velocity.y;
        cube.position.z += velocity.z;

        // Update bounding sphere position
        boundingSpheresRef.current[index].center.copy(cube.position);

        // Bounce off boundaries
        if (Math.abs(cube.position.x) > 8) velocity.x *= -1;
        if (Math.abs(cube.position.y) > 8) velocity.y *= -1;
        if (Math.abs(cube.position.z) > 8) velocity.z *= -1;

        // Unique rotation for each cube
        cube.rotation.x += 0.002 + index * 0.0001;
        cube.rotation.y += 0.003 + index * 0.00005;
        cube.rotation.z += 0.0025 + index * 0.0001;
        
        // Pulse scale effect based on sine wave
        const pulseSpeed = 0.15 + index * 0.01;
        const pulseStrength = 0.03;
        const basescale = 0.5 + (index % 5) * 0.1;
        const pulse = Math.sin(timeRef.current * pulseSpeed) * pulseStrength;
        const newScale = basescale + pulse;
        cube.scale.set(newScale, newScale, newScale);
        
        // Update bounding sphere radius with pulsing effect
        boundingSpheresRef.current[index].radius = newScale * 0.8;
      });
      
      // Check for collisions between all pairs of objects
      for (let i = 0; i < cubesRef.current.length; i++) {
        for (let j = i + 1; j < cubesRef.current.length; j++) {
          const sphere1 = boundingSpheresRef.current[i];
          const sphere2 = boundingSpheresRef.current[j];
          
          // Calculate distance between sphere centers
          const distance = sphere1.center.distanceTo(sphere2.center);
          const minDistance = sphere1.radius + sphere2.radius;
          
          // If spheres are colliding
          if (distance < minDistance) {
            // Get the objects and their velocities
            const obj1 = cubesRef.current[i];
            const obj2 = cubesRef.current[j];
            const vel1 = velocitiesRef.current[i];
            const vel2 = velocitiesRef.current[j];
            
            // Calculate collision normal
            const normal = new THREE.Vector3()
              .subVectors(sphere2.center, sphere1.center)
              .normalize();
            
            // Apply impulse-based collision response
            // Calculate relative velocity
            const relativeVelocity = new THREE.Vector3(
              vel2.x - vel1.x,
              vel2.y - vel1.y,
              vel2.z - vel1.z
            );
            
            // Calculate impulse scale
            const impulseScale = 1.5; // Can be adjusted for more "bouncy" collisions
            const impulse = relativeVelocity.dot(normal) * impulseScale;
            
            // Apply impulse to velocities
            vel1.x += normal.x * impulse;
            vel1.y += normal.y * impulse;
            vel1.z += normal.z * impulse;
            
            vel2.x -= normal.x * impulse;
            vel2.y -= normal.y * impulse;
            vel2.z -= normal.z * impulse;

            // Limit velocities after collision
            limitVelocity(vel1);
            limitVelocity(vel2);
            
            // Move objects apart slightly to prevent sticking
            const moveScale = (minDistance - distance) / 2;
            obj1.position.x -= normal.x * moveScale;
            obj1.position.y -= normal.y * moveScale;
            obj1.position.z -= normal.z * moveScale;
            
            obj2.position.x += normal.x * moveScale;
            obj2.position.y += normal.y * moveScale;
            obj2.position.z += normal.z * moveScale;
            
            // Update bounding spheres after moving objects
            boundingSpheresRef.current[i].center.copy(obj1.position);
            boundingSpheresRef.current[j].center.copy(obj2.position);
          }
        }
      }

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const container = containerRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      cubesRef.current = [];
      velocitiesRef.current = [];
      boundingSpheresRef.current = [];
    };
  }, []);

  return <div ref={containerRef} className="background-animation" />;
};

export default BackgroundAnimation; 