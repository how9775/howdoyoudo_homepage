'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const velocityArrayRef = useRef<Float32Array | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ✅ 부드러운 원형 텍스처 생성 함수
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const center = size / 2;
      const radius = size / 2;

      // 방사형 그라데이션으로 부드러운 원 생성
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');    // 중심: 완전 불투명
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)'); // 중간: 반투명
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');     // 가장자리: 완전 투명

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    };

    // Particle System - Adjust count for mobile
    const particlesGeometry = new THREE.BufferGeometry();
    const isMobile = window.innerWidth <= 768;
    const particlesCount = isMobile ? 1000 : 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200;
      velocityArray[i] = (Math.random() - 0.5) * 0.02;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );

    // 원형 텍스처를 적용한 파티클 머티리얼
    const particleTexture = createCircleTexture();
    const particlesMaterial = new THREE.PointsMaterial({
      size: isMobile ? 1.5 : 1.0,
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;
    velocityArrayRef.current = velocityArray;

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (
        particlesMesh &&
        particlesGeometry.attributes.position &&
        velocityArray
      ) {
        const positions = particlesGeometry.attributes.position
          .array as Float32Array;

        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;

          positions[i3] += velocityArray[i3];
          positions[i3 + 1] += velocityArray[i3 + 1];
          positions[i3 + 2] += velocityArray[i3 + 2];

          if (positions[i3] > 100 || positions[i3] < -100)
            velocityArray[i3] *= -1;
          if (positions[i3 + 1] > 100 || positions[i3 + 1] < -100)
            velocityArray[i3 + 1] *= -1;
          if (positions[i3 + 2] > 100 || positions[i3 + 2] < -100)
            velocityArray[i3 + 2] *= -1;
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        particlesMesh.rotation.y = mouseRef.current.x * 0.3;
        particlesMesh.rotation.x = mouseRef.current.y * 0.3;
        particlesMesh.rotation.y += 0.0005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      particlesGeometry.dispose();
      particlesMaterial.dispose();
      if (particleTexture) particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none"
    />
  );
};

export default ParticleBackground;