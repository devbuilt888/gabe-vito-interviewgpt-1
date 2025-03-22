import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BackgroundAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubesRef = useRef<THREE.Mesh[]>([]);
  const velocitiesRef = useRef<{ x: number; y: number; z: number }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const fov = 75;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;
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

    // Create cubes
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const colors = [
      0x44aa88, 0x8844aa, 0xaa8844, 0xaa4488, 0x88aa44,
      0x4488aa, 0x88aa88, 0xaa4488, 0x44aa44, 0x8844aa
    ];

    for (let i = 0; i < 10; i++) {
      const material = new THREE.MeshPhongMaterial({ 
        color: colors[i],
        transparent: true,
        opacity: 0.7
      });
      const cube = new THREE.Mesh(geometry, material);
      
      // Random initial position
      cube.position.x = (Math.random() - 0.5) * 10;
      cube.position.y = (Math.random() - 0.5) * 10;
      cube.position.z = (Math.random() - 0.5) * 10;
      
      // Random initial velocity
      velocitiesRef.current.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });

      scene.add(cube);
      cubesRef.current.push(cube);
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      cubesRef.current.forEach((cube, index) => {
        const velocity = velocitiesRef.current[index];
        
        // Update position
        cube.position.x += velocity.x;
        cube.position.y += velocity.y;
        cube.position.z += velocity.z;

        // Bounce off boundaries
        if (Math.abs(cube.position.x) > 5) velocity.x *= -1;
        if (Math.abs(cube.position.y) > 5) velocity.y *= -1;
        if (Math.abs(cube.position.z) > 5) velocity.z *= -1;

        // Rotate
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
      });

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
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="background-animation" />;
};

export default BackgroundAnimation; 