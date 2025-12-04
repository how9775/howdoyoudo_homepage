'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ProcessFlowProps {
  className?: string;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // === Scene ===
    const scene = new THREE.Scene();

    // === Camera ===
    const camera = new THREE.PerspectiveCamera(
      50,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.z = 200;
    camera.lookAt(0, 0, 0);

    // === Renderer ===
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerWidth, containerHeight);
    container.appendChild(renderer.domElement);

    // === 원형 텍스처 생성 함수 ===
    const createCircleTexture = (textContent: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 배경 그라디언트
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // 외곽 원 테두리
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(256, 256, 230, 0, Math.PI * 2);
      ctx.stroke();

      // 텍스트
      if (textContent) {
        ctx.font = '900 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 20;
        
        for (let i = 0; i < 8; i++) {
          ctx.fillText(textContent, 256, 256);
        }
      }

      return new THREE.CanvasTexture(canvas);
    };

    // === 세 개의 원 생성 ===
    const circleRadius = 30;
    const spacing = 80;
    
    const circles: THREE.Mesh[] = [];
    const circlePositions = [
      new THREE.Vector3(-spacing, 0, 0),  // 기획
      new THREE.Vector3(0, 0, 0),         // 준비
      new THREE.Vector3(spacing, 0, 0)    // 운영
    ];
    const texts = ['기획', '준비', '운영'];

    texts.forEach((text, index) => {
      const geometry = new THREE.CircleGeometry(circleRadius, 64);
      const material = new THREE.MeshStandardMaterial({
        map: createCircleTexture(text),
        transparent: true,
        opacity: 0.9,
        emissive: 0xffffff,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
      });

      const circle = new THREE.Mesh(geometry, material);
      circle.position.copy(circlePositions[index]);
      circles.push(circle);
      scene.add(circle);
    });

    // === 코로나 형태 파티클 시스템 ===
    const particleCount = 800; // 많은 파티클로 밀집되게
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // 각 파티클의 속성
    const particleData: Array<{
      angle: number;           // 각도
      radiusOffset: number;    // 원으로부터의 거리
      waveOffset: number;      // 물결 오프셋
      speed: number;           // 이동 속도
      circleIndex: number;     // 어느 원에 속하는지 (0: 기획, 1: 준비, 2: 운영)
      pathProgress: number;    // 경로상의 진행도 (0~1)
    }> = [];

    // 각 원 주위에 파티클 분포
    for (let i = 0; i < particleCount; i++) {
      const progress = i / particleCount;
      
      let circleIndex: number;
      let angle: number;
      
      // 파티클을 세 구간으로 나눔
      if (progress < 0.33) {
        // 기획 원 주위
        circleIndex = 0;
        angle = (progress / 0.33) * Math.PI * 2;
      } else if (progress < 0.66) {
        // 준비 원 주위
        circleIndex = 1;
        angle = ((progress - 0.33) / 0.33) * Math.PI * 2;
      } else {
        // 운영 원 주위
        circleIndex = 2;
        angle = ((progress - 0.66) / 0.34) * Math.PI * 2;
      }

      particleData.push({
        angle: angle,
        radiusOffset: circleRadius + 5 + Math.random() * 15, // 원에서 5~20 떨어진 위치
        waveOffset: Math.random() * Math.PI * 2,
        speed: 0.0005 + Math.random() * 0.0005, // 매우 느린 속도
        circleIndex: circleIndex,
        pathProgress: progress
      });

      // 색상 (70% 흰색, 30% 노란색)
      const isYellow = Math.random() > 0.7;
      if (isYellow) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.3;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 파티클 텍스처
    const particleTexture = (() => {
      const canvas = document.createElement('canvas');
      const size = 32;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    })();

    const particleMaterial = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // === Lighting ===
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    const point = new THREE.PointLight(0xffffff, 1.0);
    point.position.set(0, 0, 50);
    scene.add(ambient, point);

    // === Animation ===
    const clock = new THREE.Clock();
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // 원들 약간 회전
      circles.forEach((circle, index) => {
        circle.rotation.z = Math.sin(time * 0.3 + index) * 0.1;
      });

      // 파티클 업데이트
      const positions = particleGeometry.attributes.position.array as Float32Array;
      const sizes = particleGeometry.attributes.size.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        
        // 각도 업데이트 (천천히 회전)
        data.angle += data.speed;
        if (data.angle > Math.PI * 2) {
          data.angle -= Math.PI * 2;
        }

        // 전체 진행도 업데이트 (원에서 원으로 이동)
        data.pathProgress += 0.00005;
        if (data.pathProgress > 1) {
          data.pathProgress -= 1;
        }

        // 현재 어느 원에 있는지 계산
        let currentCircleIndex: number;
        let transitionProgress: number = 0;
        
        if (data.pathProgress < 0.3) {
          currentCircleIndex = 0; // 기획
        } else if (data.pathProgress < 0.35) {
          // 기획 → 준비 전환
          currentCircleIndex = 0;
          transitionProgress = (data.pathProgress - 0.3) / 0.05;
        } else if (data.pathProgress < 0.65) {
          currentCircleIndex = 1; // 준비
        } else if (data.pathProgress < 0.7) {
          // 준비 → 운영 전환
          currentCircleIndex = 1;
          transitionProgress = (data.pathProgress - 0.65) / 0.05;
        } else {
          currentCircleIndex = 2; // 운영
        }

        // 물결 효과 (코로나 형태)
        const waveAmplitude = 5;
        const waveFrequency = 5;
        const wave = Math.sin(data.angle * waveFrequency + time * 2 + data.waveOffset) * waveAmplitude;
        
        // 현재 반지름 (물결 포함)
        const currentRadius = data.radiusOffset + wave;

        // 원의 중심 위치
        const centerPos = circlePositions[currentCircleIndex].clone();
        
        // 전환 중이면 다음 원으로 보간
        if (transitionProgress > 0) {
          const nextCircleIndex = Math.min(currentCircleIndex + 1, 2);
          const nextCenterPos = circlePositions[nextCircleIndex];
          centerPos.lerp(nextCenterPos, transitionProgress);
        }

        // 파티클 위치 계산
        positions[i * 3] = centerPos.x + Math.cos(data.angle) * currentRadius;
        positions[i * 3 + 1] = centerPos.y + Math.sin(data.angle) * currentRadius;
        positions[i * 3 + 2] = Math.sin(time * 2 + i * 0.1) * 1.5;

        // 크기 변화 (반짝임)
        sizes[i] = (0.5 + Math.random() * 1.5) * (1 + Math.sin(time * 3 + i) * 0.2);
      }

      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.size.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // === Resize Handler ===
    const handleResize = () => {
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // === Cleanup ===
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      circles.forEach(circle => {
        circle.geometry.dispose();
        (circle.material as THREE.Material).dispose();
        if ((circle.material as THREE.MeshStandardMaterial).map) {
          (circle.material as THREE.MeshStandardMaterial).map?.dispose();
        }
      });

      particleGeometry.dispose();
      particleMaterial.dispose();
      if (particleTexture) particleTexture.dispose();
      renderer.dispose();

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
    />
  );
};

export default ProcessFlow;