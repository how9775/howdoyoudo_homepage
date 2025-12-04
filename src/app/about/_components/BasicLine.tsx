'use client';

import React, { useEffect, useState, useRef } from 'react';

interface BasicLineProps {
    fromPosition: 'left' | 'right';
    toPosition: 'left' | 'right';
}

export default function BasicLine({ fromPosition, toPosition }: BasicLineProps) {
    const [progress, setProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // 화면에 들어오면 애니메이션
            const scrollProgress = Math.max(
                0,
                Math.min(1, (windowHeight - rect.top) / windowHeight)
            );
            
            setProgress(scrollProgress);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const height = 400;
    const width = 1600;
    
    // 시작점과 끝점
    let startX, startY, endX, endY;
    
    if (fromPosition === 'left' && toPosition === 'right') {
        startX = 400;
        startY = 50;
        endX = 1200;
        endY = height - 50;
    } else if (fromPosition === 'right' && toPosition === 'left') {
        startX = 1200;
        startY = 50;
        endX = 400;
        endY = height - 50;
    } else if (fromPosition === 'left' && toPosition === 'left') {
        startX = 400;
        startY = 50;
        endX = 400;
        endY = height - 50;
    } else {
        startX = 1200;
        startY = 50;
        endX = 1200;
        endY = height - 50;
    }

    // S자 곡선 컨트롤 포인트
    const cp1x = startX + (endX - startX) * 0.3;
    const cp1y = startY + (endY - startY) * 0.4;
    const cp2x = endX - (endX - startX) * 0.3;
    const cp2y = endY - (endY - startY) * 0.4;

    const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    // 대략적인 경로 길이
    const pathLength = 800;
    const dashOffset = pathLength * (1 - progress);

    return (
        <div ref={containerRef} className="relative w-full" style={{ height: `${height}px` }}>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full max-w-[1600px]"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        <linearGradient id="grayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6b7280" />
                            <stop offset="50%" stopColor="#4b5563" />
                            <stop offset="100%" stopColor="#374151" />
                        </linearGradient>
                    </defs>

                    {/* 배경 점선 */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#d1d5db"
                        strokeWidth="5"
                        strokeDasharray="8 4"
                        opacity="0.4"
                    />

                    {/* 메인 라인 */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="url(#grayGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={dashOffset}
                        style={{
                            transition: 'stroke-dashoffset 0.5s ease-out',
                            filter: 'drop-shadow(0 0 4px rgba(107, 114, 128, 0.4))',
                        }}
                    />

                    {/* 움직이는 점 */}
                    {progress > 0.2 && progress < 0.9 && (
                        <>
                            <circle r="10" fill="#4b5563" opacity="0.3">
                                <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
                            </circle>
                            <circle r="5" fill="#1f2937">
                                <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
                            </circle>
                        </>
                    )}

                    {/* 끝점 */}
                    {progress > 0.85 && (
                        <g>
                            <circle cx={endX} cy={endY} r="8" fill="#4b5563" opacity="0.5">
                                <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={endX} cy={endY} r="5" fill="#1f2937" />
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
}