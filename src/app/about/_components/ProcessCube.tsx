'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ProcessCubeProps {
  text: string;
}

const ProcessCube: React.FC<ProcessCubeProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const floatOffsetRef = useRef(Math.random() * Math.PI * 2);
  const floatSpeedRef = useRef(0.5 + Math.random() * 0.3);

  const cubeSize = 45;
  const textScale = 1.5;

  const computeCameraDistanceToFit = (
    size: number,
    fovDeg: number,
    aspect: number
  ) => {
    const radius = Math.sqrt(3 * Math.pow(size / 2, 2));
    const fov = (fovDeg * Math.PI) / 180;
    const distY = radius / Math.tan(fov / 2);
    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const distX = radius / Math.tan(horizontalFov / 2);
    return Math.max(distX, distY);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerSize = container.offsetWidth; // 부모 크기 가져오기

    // === Scene ===
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // === Camera ===
    const aspect = 1;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    const fittedDistance = computeCameraDistanceToFit(cubeSize, camera.fov, aspect);
    camera.position.z = fittedDistance * 1.05;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // === Renderer ===
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerSize, containerSize, false); // 컨테이너 크기에 맞춤
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === 텍스처 생성 ===
    const createTexture = (textContent: string, isMain = false, scale = 1) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      if (!isMain) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 452, 452);
      }

      if (textContent) {
        ctx.font = `900 ${100 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 10; i++) {
          ctx.fillText(textContent, 256, 256);
        }
      }

      return new THREE.CanvasTexture(canvas);
    };

    // === Materials ===
    const materials = [
      new THREE.MeshStandardMaterial({ map: createTexture('', false, textScale), transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({ map: createTexture('', false, textScale), transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({ map: createTexture('', false, textScale), transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({ map: createTexture('', false, textScale), transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({
        map: createTexture(text, true, textScale),
        transparent: true,
        opacity: 0.8,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
      }),
      new THREE.MeshStandardMaterial({ map: createTexture('', false, textScale), transparent: true, opacity: 0.8 }),
    ];

    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cube = new THREE.Mesh(geometry, materials);
    cubeRef.current = cube;

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 4,
      transparent: true,
      opacity: 0.8,
    });
    cube.add(new THREE.LineSegments(edges, lineMaterial));

    scene.add(cube);

    // === Lighting ===
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    const point1 = new THREE.PointLight(0xffffff, 1.5);
    point1.position.set(10, 10, 10);
    const point2 = new THREE.PointLight(0xffffff, 1.2);
    point2.position.set(-10, -10, 10);
    scene.add(ambient, point1, point2);

    // === Interaction ===
    const canvas = renderer.domElement;
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - previousMousePositionRef.current.x;
      const dy = e.clientY - previousMousePositionRef.current.y;
      targetRotationRef.current.y += dx * 0.015;
      targetRotationRef.current.x += dy * 0.015;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    const stopDragging = () => (isDraggingRef.current = false);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);

    // === Animation ===
    const clock = new THREE.Clock();
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();
      cube.position.y = Math.sin(t * floatSpeedRef.current + floatOffsetRef.current) * 0.3;

      if (!isDraggingRef.current) {
        targetRotationRef.current.x *= 0.9;
        targetRotationRef.current.y *= 0.9;
      }

      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.1;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.1;

      cube.rotation.x = rotationRef.current.x;
      cube.rotation.y = rotationRef.current.y;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationIdRef.current!);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', stopDragging);
      canvas.removeEventListener('mouseleave', stopDragging);
      geometry.dispose();
      edges.dispose();
      materials.forEach(m => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
};

export default ProcessCube;