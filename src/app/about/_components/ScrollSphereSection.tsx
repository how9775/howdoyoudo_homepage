'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RGBELoader } from 'three-stdlib';
import { FontLoader, TextGeometry } from 'three-stdlib';

interface AnimatedSphereProps {
    scrollProgress: number;
    title: string;
}

function EnvironmentHDR() {
    const { scene, gl } = useThree();

    useEffect(() => {
        const loader = new RGBELoader();
        loader.load(
            '/hdr/studio_small_08_1k.hdr',
            (hdr) => {
                hdr.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = hdr;
                scene.environmentIntensity = 1.0;
                scene.background = null;
            },
            undefined,
            (error) => {
                console.warn('HDR loading failed, using fallback lighting:', error);
                scene.background = null;
            }
        );
    }, [scene, gl]);

    return null;
}

function CurvedTextOnSphere({
    radius = 1.5,
    text = '',
    size = 0.28,
    height = 0.03,
    color = '#2b2b2b',
    fontUrl = '/fonts/Pretendard-ExtraBold.json',
}: {
    radius?: number;
    text: string;
    size?: number;
    height?: number;
    color?: string;
    fontUrl?: string;
}) {
    const font = useLoader(FontLoader, fontUrl) as any;

    const { geometry, material } = useMemo(() => {
        if (!font) return { geometry: undefined, material: undefined };

        const geo = new TextGeometry(text, {
            font: font,
            size: size,
            height: height,
            curveSegments: 12,
        }) as THREE.BufferGeometry;

        geo.computeBoundingBox();
        const bbox = geo.boundingBox!;
        const width = bbox.max.x - bbox.min.x;

        const safeWidth = Math.max(width, 0.0001);
        const angle = safeWidth / radius;

        const posAttr = geo.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        const centerX = bbox.min.x + width / 2;

        for (let i = 0; i < posArray.length; i += 3) {
            const x = posArray[i];
            const y = posArray[i + 1];

            const xCentered = x - centerX;
            const nx = xCentered / safeWidth;
            const theta = nx * angle;

            const newX = Math.sin(theta) * radius;
            const newZ = Math.cos(theta) * radius - radius;

            posArray[i] = newX;
            posArray[i + 1] = y - 0.15;
            posArray[i + 2] = newZ;
        }

        posAttr.needsUpdate = true;
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            metalness: 0.1,
            roughness: 0.6,
            side: THREE.DoubleSide,
        });

        return { geometry: geo, material: mat };
    }, [font, text, size, height, color, radius, fontUrl]);

    if (!geometry || !material) return null;

    return (
        <group position={[0, 0, radius]}>
            <mesh geometry={geometry} material={material} rotation={[0, 0, 0]} />
        </group>
    );
}

interface InteractiveSphereProps extends AnimatedSphereProps {
    isDragging: boolean;
    dragDelta: { x: number; y: number };
    onRotationUpdate: (rotation: { x: number; y: number }) => void;
}

function InteractiveSphere({ 
    scrollProgress, 
    title, 
    isDragging, 
    dragDelta,
    onRotationUpdate 
}: InteractiveSphereProps) {
    const groupRef = useRef<THREE.Group>(null);
    const baseRotation = useRef({ x: 0, y: 0 }); // 드래그 시작 시 회전값
    const currentRotation = useRef({ x: 0, y: 0 }); // 현재 실제 회전값

    const [baseColor, normal, roughness, metallic] = useTexture([
        '/textures/Metal061B_1K-PNG_Color.png',
        '/textures/Metal061B_1K-PNG_NormalGL.png',
        '/textures/Metal061B_1K-PNG_Roughness.png',
        '/textures/Metal061B_1K-PNG_Metalness.png',
    ]);

    const normalScale = useMemo(() => new THREE.Vector2(1.5, 1.5), []);

    useMemo(() => {
        if (!baseColor || !normal || !roughness || !metallic) return;
        if ('colorSpace' in baseColor) baseColor.colorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;
        if ('colorSpace' in normal) normal.colorSpace = (THREE as any).LinearSRGBColorSpace ?? (THREE as any).LinearEncoding;
        if ('colorSpace' in roughness) roughness.colorSpace = (THREE as any).LinearSRGBColorSpace ?? (THREE as any).LinearEncoding;
        if ('colorSpace' in metallic) metallic.colorSpace = (THREE as any).LinearSRGBColorSpace ?? (THREE as any).LinearEncoding;
    }, [baseColor, normal, roughness, metallic]);

    // 드래그가 시작되면 현재 회전을 기준으로 저장
    useEffect(() => {
        if (isDragging) {
            baseRotation.current = { ...currentRotation.current };
        }
    }, [isDragging]);

    useFrame(() => {
        if (!groupRef.current) return;

        let targetX: number;
        let targetY: number;

        if (isDragging) {
            // 드래그 중: 시작 회전 + 드래그 델타
            const sensitivity = 0.005; // 0.01 → 0.005로 감도 절반으로 줄임
            targetX = baseRotation.current.x + dragDelta.y * sensitivity; // 위아래
            targetY = baseRotation.current.y + dragDelta.x * sensitivity; // 좌우
            
            // X축 회전 제한
            targetX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetX));
            
            // 즉시 적용 (드래그 중에는 딜레이 없이)
            currentRotation.current.x = targetX;
            currentRotation.current.y = targetY;
        } else {
            // 드래그 종료: 원래 스크롤 회전으로 복귀
            targetX = 0;
            targetY = scrollProgress * Math.PI * 2; // Math.PI * 4 → Math.PI * 2 (2바퀴 → 1바퀴)
            
            // 스크롤 기반일 때는 정확히 따라가도록 lerp factor 높임
            const lerpFactor = 0.15; // 0.05 → 0.15로 더 빠르게 따라감
            currentRotation.current.x += (targetX - currentRotation.current.x) * lerpFactor;
            currentRotation.current.y += (targetY - currentRotation.current.y) * lerpFactor;
        }

        groupRef.current.rotation.x = currentRotation.current.x;
        groupRef.current.rotation.y = currentRotation.current.y;

        // 현재 회전값을 부모에게 전달
        onRotationUpdate(currentRotation.current);
    });

    return (
        <group ref={groupRef}>
            <mesh scale={1.5}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={baseColor}
                    normalMap={normal}
                    normalScale={normalScale}
                    roughnessMap={roughness}
                    metalnessMap={metallic}
                    metalness={1.0}
                    roughness={1.8}
                    envMapIntensity={4.0}
                />
            </mesh>

            <CurvedTextOnSphere
                text={title}
                radius={1.505}
                size={0.28}
                height={0.01}
                color="#161616"
                fontUrl="/fonts/Pretendard-ExtraBold.json"
            />
        </group>
    );
}

interface ContentItem {
    number: string;
    subtitle: string;
    description: string;
}

interface ScrollSphereSectionProps {
    position: 'left' | 'right';
    contents: ContentItem[];
    title: string;
    bg?: string;
    sectionId?: string;
}

export default function ScrollSphereSection({
    position,
    contents,
    title,
    bg = 'white',
    sectionId,
}: ScrollSphereSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [sphereOpacity, setSphereOpacity] = useState(0);
    
    // 드래그 상태
    const [isDragging, setIsDragging] = useState(false);
    const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const currentRotation = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const sectionHeight = rect.height;
            const sectionTop = rect.top;
            const windowHeight = window.innerHeight;

            const visibleProgress = Math.max(
                0,
                Math.min(
                    1,
                    (windowHeight - sectionTop) / (windowHeight + sectionHeight / 2)
                )
            );

            const sphereProgress = Math.min(1, visibleProgress * 2);

            setScrollProgress(sphereProgress);
            setSphereOpacity(sphereProgress);

            if (sphereProgress === 1 && !isTextVisible) {
                setIsTextVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isTextVisible]);

    const handlePointerDown = (e: React.PointerEvent) => {
        // 스크롤 애니메이션이 완료되지 않았으면 드래그 비활성화
        if (scrollProgress < 1) return;
        
        e.preventDefault();
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        setDragDelta({ x: 0, y: 0 }); // 델타 초기화
        
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grabbing';
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        setDragDelta({ x: deltaX, y: deltaY });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grab';
        }
    };

    const handlePointerLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            if (canvasRef.current) {
                canvasRef.current.style.cursor = 'grab';
            }
        }
    };

    const handleRotationUpdate = (rotation: { x: number; y: number }) => {
        currentRotation.current = rotation;
    };

    return (
        <div ref={sectionRef} className={`relative h-[200vh] w-full ${bg}`}>
            <div className="sticky top-0 h-screen w-full flex items-center justify-center py-20 overflow-visible">
                <div
                    className="relative w-full max-w-[1600px] mx-auto px-16 flex items-center gap-20"
                    style={{ minHeight: '100vh' }}
                >
                    {/* 3D Sphere */}
                    <div
                        ref={canvasRef}
                        className={`flex-shrink-0 ${position === 'left' ? 'order-1' : 'order-2'}`}
                        style={{
                            width: '700px',
                            height: '700px',
                            opacity: sphereOpacity,
                            transform: `translateX(${position === 'left'
                                    ? `${(1 - scrollProgress) * -100}%`
                                    : `${(1 - scrollProgress) * 100}%`
                                })`,
                            transition: 'opacity 0.5s ease-out',
                            cursor: scrollProgress >= 1 ? 'grab' : 'default', // 스크롤 완료 후에만 grab
                            touchAction: 'none', // 터치 스크롤 방지
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerLeave}
                    >
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 50 }}
                            gl={{
                                outputColorSpace: (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding,
                                toneMapping: THREE.ACESFilmicToneMapping,
                                toneMappingExposure: 1.2,
                            }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <EnvironmentHDR />

                            <ambientLight intensity={0.8} />
                            <directionalLight position={[10, 10, 10]} intensity={1.5} />
                            <directionalLight position={[-10, 10, 5]} intensity={1.0} />
                            <pointLight position={[5, 5, 5]} intensity={1.2} />

                            <InteractiveSphere 
                                scrollProgress={scrollProgress} 
                                title={title}
                                isDragging={isDragging}
                                dragDelta={dragDelta}
                                onRotationUpdate={handleRotationUpdate}
                            />
                        </Canvas>
                    </div>

                    {/* Text Content */}
                    <div
                        className={`flex-1 max-w-2xl ${position === 'left' ? 'order-2' : 'order-1'}`}
                        style={{
                            opacity: isTextVisible ? 1 : 0,
                            transform: `translateX(${isTextVisible ? 0 : position === 'left' ? '50px' : '-50px'})`,
                            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                        }}
                    >
                        <div 
                            id={sectionId}
                            className="space-y-10"
                        >
                            {contents.map((content, index) => (
                                <div
                                    key={index}
                                    className="relative group"
                                    style={{
                                        opacity: isTextVisible ? 1 : 0,
                                        transform: `translateY(${isTextVisible ? 0 : '30px'})`,
                                        transition: `opacity 0.6s ease-out ${index * 0.15 + 0.3}s, transform 0.6s ease-out ${index * 0.15 + 0.3}s`,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-800 via-gray-600 to-gray-400 rounded-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                                    
                                    <div className="pl-8 pr-4 py-6">
                                        <div className="flex items-start gap-4 mb-2">
                                            <span className="text-5xl font-black text-gray-400 leading-none group-hover:text-gray-800 transition-colors duration-300">
                                                {content.number}
                                            </span>
                                            <h3 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight mt-3">
                                                {content.subtitle}
                                            </h3>
                                        </div>
                                        <p className="text-lg text-gray-600 leading-relaxed pl-1 group-hover:text-gray-800 transition-colors duration-300">
                                            {content.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}