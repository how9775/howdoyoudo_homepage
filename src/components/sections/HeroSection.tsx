'use client'

import { useEffect, useRef, useState } from 'react'
import CTAButton from '../ui/CTAButton'

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showIntroButton, setShowIntroButton] = useState(true)

  useEffect(() => {
    // 설정 로드
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success && data.data) {
          setShowIntroButton(data.data.introductionFileShown);
        }
      } catch (error) {
        console.error('설정 로드 오류:', error);
        // 에러시 기본값(true)으로 표시
        setShowIntroButton(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !contentRef.current) return

      const scrolled = window.scrollY
      const heroHeight = heroRef.current.offsetHeight
      const scrollProgress = Math.min(scrolled / heroHeight, 1)

      // 전체 콘텐츠에 패럴랙스 효과 적용
      contentRef.current.style.transform = `translateY(${scrolled * 0.3}px)`
      contentRef.current.style.opacity = `${1 - scrollProgress * 1.2}` // 더 빠르게 사라지도록
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-gray-300 rounded-full animate-float-slow" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-gray-400 rounded-full animate-float-medium" />
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-gray-500 rounded-full animate-float-fast" />

      {/* Main Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
          <span className="block text-gray-900 mb-4 hero-text-line-1">
            WELCOME TO
          </span>
          <span className="block bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent hero-text-line-2">
            HOWDOYOUDO
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle mt-8 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          성공적인 BTL 마케팅을 위한 One-Stop 파트너
        </p>

        {/* CTA Buttons */}
        <div className="hero-button mt-12 flex justify-center items-center gap-4">
          <CTAButton href="/works">Our Works</CTAButton>
          {showIntroButton && (
            <CTAButton invert onClick={() => window.open('/api/file/introduction', '_blank')}>
              회사 소개서
            </CTAButton>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-16 bg-gradient-to-b from-transparent via-gray-400 to-transparent rounded-full">
          <div className="w-1 h-4 bg-gray-600 rounded-full animate-scroll-indicator" />
        </div>
      </div>
    </section>
  )
}