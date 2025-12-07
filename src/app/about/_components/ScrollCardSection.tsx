'use client'

import { useEffect, useRef, useState } from 'react'

interface ContentItem {
  number: string
  subtitle: string
  description: string
}

interface ScrollCardSectionProps {
  title: string
  contents: ContentItem[]
  bg?: string
}

export default function ScrollCardSection({ title, contents, bg = 'bg-white' }: ScrollCardSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = rect.height
      const windowHeight = window.innerHeight

      // 섹션이 화면에 들어온 정도 계산 (0 ~ 1)
      const progress = Math.max(
        0,
        Math.min(
          1,
          (windowHeight - rect.top) / (sectionHeight + windowHeight)
        )
      )

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 각 카드의 애니메이션 단계 계산
  const getCardProgress = (index: number) => {
    const cardsCount = contents.length
    const titlePhase = 0.15 // 타이틀 페이드인
    const cardPhaseSize = (1 - titlePhase) / cardsCount // 각 카드가 차지하는 스크롤 비율
    
    const cardStart = titlePhase + cardPhaseSize * index
    const cardEnd = cardStart + cardPhaseSize
    
    // 각 카드의 로컬 진행도 (0 ~ 1)
    const localProgress = Math.max(
      0,
      Math.min(
        1,
        (scrollProgress - cardStart) / cardPhaseSize
      )
    )

    return {
      // 카드 나타나기 (0 ~ 0.5)
      appearProgress: Math.min(1, localProgress * 2),
      // 카드 올라가기 (0.5 ~ 1)
      riseProgress: Math.max(0, (localProgress - 0.5) * 2),
      // 카드가 활성화되었는지
      isActive: scrollProgress >= cardStart,
    }
  }

  // 타이틀 박스 애니메이션
  const titleOpacity = scrollProgress < 0.15 
    ? scrollProgress / 0.15 
    : Math.max(0.2, 1 - (scrollProgress - 0.15) * 2)
  
  const titleTranslateY = scrollProgress < 0.15 
    ? (1 - scrollProgress / 0.15) * 50 
    : 0
  
  const titleScale = scrollProgress < 0.15 
    ? 0.8 + (scrollProgress / 0.15) * 0.2 
    : Math.max(0.9, 1 - (scrollProgress - 0.15) * 0.5)

  return (
    <div
      ref={sectionRef}
      className={`relative ${bg}`}
      style={{
        height: `${300 + contents.length * 100}vh`, // 타이틀 + 각 카드당 100vh
      }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-6xl mx-auto px-8">
          
          {/* 타이틀 박스 - 가로로 긴 박스 */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
              transition: 'none',
            }}
          >
            <div 
              className="relative px-32 py-12 rounded-3xl backdrop-blur-xl bg-gradient-to-r from-white/40 via-white/60 to-white/40 border border-white/50 shadow-2xl"
              style={{
                perspective: '1000px',
              }}
            >
              <h2 className="text-8xl font-black tracking-tighter bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent">
                {title}
              </h2>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl -z-10" />
            </div>
          </div>

          {/* 카드들 */}
          <div className="relative" style={{ perspective: '2000px' }}>
            {contents.map((content, index) => {
              const { appearProgress, riseProgress, isActive } = getCardProgress(index)
              
              // 카드 위치 계산
              const baseY = 0 // 시작 위치 (화면 중앙)
              const targetY = -window.innerHeight / 3 + (index * 80) // 1/3 지점 + 간격
              const currentY = isActive 
                ? baseY + (targetY - baseY) * riseProgress 
                : baseY

              // 카드 나타나기 애니메이션
              const opacity = appearProgress
              const scale = 0.8 + appearProgress * 0.2
              
              // 이전 카드들이 쌓인 효과
              const stackOffset = index * 4
              
              return (
                <div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: isActive ? opacity : 0,
                    transform: `
                      translateY(${currentY}px) 
                      translateZ(${-stackOffset}px)
                      scale(${scale})
                      rotateX(${(1 - appearProgress) * 20}deg)
                    `,
                    transition: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  <div className="w-full max-w-4xl">
                    <div 
                      className="relative p-12 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/90 via-white/70 to-white/90 border border-white/60 shadow-2xl"
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* 카드 배경 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
                      
                      {/* 번호 */}
                      <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-xl border-4 border-white">
                        <span className="text-4xl font-black text-white">
                          {content.number}
                        </span>
                      </div>

                      {/* 내용 */}
                      <div className="relative space-y-4 pl-8">
                        <h3 className="text-4xl font-bold text-gray-900">
                          {content.subtitle}
                        </h3>
                        {content.description && (
                          <p className="text-xl text-gray-600 leading-relaxed">
                            {content.description}
                          </p>
                        )}
                      </div>

                      {/* 장식 요소 */}
                      <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
                      <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-xl" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 배경 장식 요소 */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
              style={{
                transform: `translateX(${scrollProgress * 100}px)`,
              }}
            />
            <div 
              className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              style={{
                transform: `translateX(${-scrollProgress * 100}px)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}