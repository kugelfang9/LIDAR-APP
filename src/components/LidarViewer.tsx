import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LidarPoint, CLASSIFICATION_COLORS } from '@/src/lib/lidar-utils';

interface LidarViewerProps {
  points: LidarPoint[];
  colorMode: 'intensity' | 'classification' | 'height';
}

export const LidarViewer: React.FC<LidarViewerProps> = ({ points, colorMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    points: THREE.Points;
    controls: OrbitControls;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0e);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(30, 30, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Create point cloud geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);

    points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      
      const color = new THREE.Color();
      if (colorMode === 'classification') {
        color.setHex(CLASSIFICATION_COLORS[p.classification || 0]);
      } else if (colorMode === 'height') {
        color.setHSL((p.y + 5) / 20, 0.8, 0.5);
      } else {
        color.setScalar(p.intensity);
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Grid helper
    const grid = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
    scene.add(grid);

    sceneRef.current = { scene, camera, renderer, points: pointCloud, controls };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      window.requestAnimationFrame(() => {
        if (!containerRef.current || !sceneRef.current) return;
        const { camera, renderer } = sceneRef.current;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [points, colorMode]);

  return <div ref={containerRef} className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-zinc-800" id="lidar-canvas-container" />;
};
