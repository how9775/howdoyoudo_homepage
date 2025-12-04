'use client';

import React from 'react';
import ParticleBackground from './ParticleBackground';
import ProcessFlow from './ProcessFlow';

interface AboutBannerProps {
  height?: string;
  className?: string;
  mobileHeight?: string;
}

const AboutBanner: React.FC<AboutBannerProps> = ({
  height = "100vh",
  mobileHeight = "auto",
  className = ""
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-r from-[#05060c] via-[#0a142e] to-[#05060e] ${className}`}
    >
      {/* Background Particles */}
      <ParticleBackground />

      {/* 비네팅 효과 - 검은색 그라데이션 */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* Corner Decorations - L shapes */}
      {/* Top Left - ㄱ */}
      <div className="absolute top-4 left-4 md:top-[30px] md:left-[30px] w-10 h-10 md:w-[60px] md:h-[60px] z-[3]">
        <div className="absolute top-0 left-0 w-full h-[2px] md:h-[3px] bg-white/30" />
        <div className="absolute top-0 left-0 w-[2px] md:w-[3px] h-full bg-white/30" />
      </div>

      {/* Top Right - ㄴ */}
      <div className="absolute top-4 right-4 md:top-[30px] md:right-[30px] w-10 h-10 md:w-[60px] md:h-[60px] z-[3]">
        <div className="absolute top-0 right-0 w-full h-[2px] md:h-[3px] bg-white/30" />
        <div className="absolute top-0 right-0 w-[2px] md:w-[3px] h-full bg-white/30" />
      </div>

      {/* Bottom Left - ㄴ (inverted) */}
      <div className="absolute bottom-4 left-4 md:bottom-[30px] md:left-[30px] w-10 h-10 md:w-[60px] md:h-[60px] z-[3]">
        <div className="absolute bottom-0 left-0 w-full h-[2px] md:h-[3px] bg-white/30" />
        <div className="absolute bottom-0 left-0 w-[2px] md:w-[3px] h-full bg-white/30" />
      </div>

      {/* Bottom Right - ㄱ (inverted) */}
      <div className="absolute bottom-4 right-4 md:bottom-[30px] md:right-[30px] w-10 h-10 md:w-[60px] md:h-[60px] z-[3]">
        <div className="absolute bottom-0 right-0 w-full h-[2px] md:h-[3px] bg-white/30" />
        <div className="absolute bottom-0 right-0 w-[2px] md:w-[3px] h-full bg-white/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-[2] w-full md:h-screen flex flex-col justify-center items-center text-white text-center px-4 md:px-5 py-12 md:py-20">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-wider mb-3 md:mb-6 opacity-0 -translate-y-[30px] animate-[fadeInDown_1s_ease_0.3s_forwards] [text-shadow:0_0_30px_rgba(100,200,255,0.5)] leading-tight">
          HOWDOYOUDO CO.,LTD
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-lg lg:text-xl mb-1 md:mb-2 opacity-0 -translate-y-[20px] animate-[fadeInDown_1s_ease_0.6s_forwards] text-white/90 px-4">
          주식회사 하우두유두는 고객이 목표하는 마케팅 성과를 위해
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-lg lg:text-xl mb-6 md:mb-12 opacity-0 -translate-y-[20px] animate-[fadeInDown_1s_ease_0.9s_forwards] text-white/90 px-4">
          BTL영역의 통합적인 Marketing 전략으로 One-Stop Service를 제공합니다.
        </p>

        {/* Process Flow - 3개의 원과 흐르는 파티클을 하나의 컴포넌트로 */}
        <div className="w-full max-w-[900px] h-[120px] sm:h-[150px] md:h-[250px] lg:h-[280px] xl:h-[300px] opacity-0 scale-75 animate-[fadeInScale_0.8s_ease_1.2s_forwards]">
          <ProcessFlow />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutBanner;