'use client'

import { useEffect, useRef, useState } from 'react'

interface ContentItem {
  number: string
  subtitle: string
  description: string
}

interface CardData {
  title: string
  contents: ContentItem[]
}

interface ScrollStackSectionProps {
  cards: CardData[]
  bg?: string
}

export default function ScrollStackSection({ cards, bg = 'bg-white' }: ScrollStackSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 🚀 성능 최적화: requestAnimationFrame + passive listener
  useEffect(() => {
    let rafId: number | null = null
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        rafId = requestAnimationFrame(() => {
          if (!sectionRef.current) {
            ticking = false
            return
          }

          const rect = sectionRef.current.getBoundingClientRect()
          const sectionHeight = rect.height
          const windowHeight = window.innerHeight

          const progress = Math.max(
            0,
            Math.min(
              1,
              (windowHeight - rect.top) / (sectionHeight + windowHeight)
            )
          )

          setScrollProgress(progress)
          ticking = false
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const getCardProgress = (cardIndex: number) => {
    const cardCount = cards.length
    const phaseSize = 1 / cardCount
    const start = phaseSize * cardIndex
    const end = start + phaseSize

    const localProgress = Math.max(
      0,
      Math.min(
        1,
        (scrollProgress - start) / phaseSize
      )
    )

    return {
      localProgress,
      isActive: scrollProgress >= start,
      isComplete: scrollProgress >= end,
    }
  }

  const getContentProgress = (cardIndex: number, itemIndex: number) => {
    const { localProgress } = getCardProgress(cardIndex)
    const itemCount = cards[cardIndex].contents.length
    
    const itemPhaseStart = 0.2
    const itemPhaseEnd = 0.9
    const itemPhaseSize = (itemPhaseEnd - itemPhaseStart) / itemCount
    
    const itemStart = itemPhaseStart + itemPhaseSize * itemIndex
    const itemEnd = itemStart + itemPhaseSize
    
    if (localProgress < itemStart) return 0
    if (localProgress > itemEnd) return 1
    
    return (localProgress - itemStart) / itemPhaseSize
  }

  return (
    <div
      ref={sectionRef}
      className={`relative ${bg} mb-32`}
      style={{
        height: `${cards.length * 400}vh`,
      }}
    >
      <div className="sticky top-0 h-screen w-full flex items-start justify-center pt-4">
        <div className="relative w-full h-full flex items-start justify-center pt-2">
          
          {cards.map((card, cardIndex) => {
            const { localProgress, isActive } = getCardProgress(cardIndex)
            
            const nextCardIndex = cardIndex + 1
            const hasNextCard = nextCardIndex < cards.length
            const nextCardProgress = hasNextCard ? getCardProgress(nextCardIndex) : { localProgress: 0 }
            const nextAppearProgress = hasNextCard ? Math.min(1, nextCardProgress.localProgress / 0.15) : 0
            
            const appearProgress = Math.min(1, localProgress / 0.15)
            
            let transform = ''
            
            if (isMobile) {
              // 모바일: 아래에서 위로 올라오며 스택
              const titleBarHeight = 56 // h-14 = 56px
              
              const stackOffsetY = cardIndex * titleBarHeight // -50 → -150으로 변경 (더 위로)
              const slideY = (1 - appearProgress) * 300
              const finalY = stackOffsetY + slideY // 최종 Y 위치
              
              // 🚀 GPU 가속을 위한 translate3d 사용 (모바일만)
              transform = `translate3d(0, ${finalY}px, 0)`
            } else {
              // 데스크톱: 오른쪽으로 스택
              const stackOffsetX = cardIndex * 80 - 70
              const slideX = (1 - appearProgress) * 300
              const finalX = slideX + stackOffsetX
              
              transform = `translateX(${finalX}px)`
            }
            
            const cardOpacity = appearProgress
            // z-index: 최신 카드가 위에 (cardIndex가 클수록 위)
            const zIndex = cardIndex * 10
            
            return (
              <div
                key={cardIndex}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  zIndex,
                  opacity: isActive ? cardOpacity : 0,
                  transform,
                  transition: 'none',
                  pointerEvents: 'none',
                  // 🚀 GPU 가속 활성화 (활성 카드만, 애니메이션 중에만)
                  willChange: isActive && appearProgress < 1 ? 'transform, opacity' : 'auto',
                }}
              >
                {isMobile ? (
                  /* 모바일: 타이틀바 + 카드를 하나의 박스로 */
                  <div 
                    className="relative w-[90vw] h-[75vh] bg-gradient-to-br from-white/70 via-white/90 to-white/70 border-2 border-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      // 🚀 모바일: backdrop-blur 강도 줄임 (24px → 8px)
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    {/* 타이틀바 */}
                    {isActive && (
                      <div 
                        className="w-full h-14 flex items-center justify-center bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-b-2 border-white/50 flex-shrink-0"
                        style={{
                          opacity: cardOpacity,
                        }}
                      >
                        <div className="text-white font-black tracking-wider text-lg">
                          {card.title}
                        </div>
                      </div>
                    )}

                    {/* 메인 컨텐츠 */}
                    <div 
                      className="relative px-5 py-4 flex items-center flex-1 overflow-y-auto"
                      style={{
                        perspective: '2000px',
                      }}
                    >
                      {/* 배경 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                      {/* 🚀 모바일: 배경 blur 제거 (성능 개선) */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 -z-10" />

                      {/* 타이틀 배경 */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          opacity: localProgress < 0.2 
                            ? localProgress * 5
                            : 0.40,
                        }}
                      >
                        <h2 
                          className="font-black tracking-tighter bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-clip-text text-transparent leading-none select-none text-center px-4"
                          style={{
                            fontSize: 'clamp(2.5rem, 12vw, 4rem)',
                          }}
                        >
                          {card.title}
                        </h2>
                      </div>

                      {/* 내용 */}
                      <div className="relative z-10 w-full">
                        <div className="grid grid-cols-1 gap-3">
                        {card.contents.map((content, itemIndex) => {
                          const itemOpacity = getContentProgress(cardIndex, itemIndex)
                          
                          return (
                            <div
                              key={itemIndex}
                              className="relative"
                              style={{
                                opacity: itemOpacity,
                                // 🚀 GPU 가속을 위한 translate3d (모바일)
                                transform: `translate3d(0, ${(1 - itemOpacity) * 15}px, 0)`,
                                transition: 'none',
                                // 🚀 애니메이션 중에만 will-change 적용 (모바일)
                                willChange: itemOpacity > 0 && itemOpacity < 1 ? 'transform, opacity' : 'auto',
                              }}
                            >
                              {itemIndex < card.contents.length - 1 && (
                                <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                              )}

                              <div className="h-full flex flex-col justify-center px-3 py-3">
                                <div className="mb-2">
                                  <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg w-10 h-10">
                                    <span className="font-black text-white text-xl">
                                      {content.number}
                                    </span>
                                  </div>
                                </div>

                                <h3 className="font-bold text-gray-900 leading-tight text-base mb-1">
                                  {content.subtitle}
                                </h3>

                                {content.description && (
                                  <p className="text-gray-600 leading-relaxed text-xs">
                                    {content.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        </div>
                      </div>

                      {/* 🚀 모바일: 장식 요소 blur 제거 (성능 개선) */}
                      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full pointer-events-none" />
                      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  /* ==================== 데스크톱: 아래 코드는 절대 건드리지 않음 ==================== */
                  <div className="relative w-[85vw] h-[65vh] flex flex-row">
                    {/* 타이틀바 - 왼쪽 */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center bg-gradient-to-r from-gray-800/90 to-gray-700/90 rounded-l-[3rem] border-2 border-white/50 border-r-0"
                        style={{
                          opacity: cardOpacity,
                        }}
                      >
                        <div 
                          className="text-white font-black text-2xl tracking-wider"
                          style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'upright',
                          }}
                        >
                          {card.title}
                        </div>
                      </div>
                    )}

                    {/* 메인 카드 */}
                    <div 
                      className="flex-1 relative px-16 py-16 backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/90 to-white/70 border-2 border-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.15)] flex items-center rounded-r-[3rem]"
                      style={{
                        perspective: '2000px',
                        marginLeft: '80px',
                      }}
                    >
                      {/* 배경 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-r-[3rem]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-r-[3rem] blur-2xl -z-10" />

                      {/* 타이틀 배경 */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          opacity: localProgress < 0.2 
                            ? localProgress * 5
                            : 0.40,
                        }}
                      >
                        <h2 
                          className="font-black tracking-tighter bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-clip-text text-transparent leading-none select-none"
                          style={{
                            fontSize: 'clamp(6rem, 12vw, 14rem)',
                          }}
                        >
                          {card.title}
                        </h2>
                      </div>

                      {/* 내용 그리드 */}
                      <div className="relative z-10 w-full">
                        <div 
                          className="grid gap-8"
                          style={{
                            gridTemplateColumns: `repeat(${card.contents.length}, 1fr)`,
                          }}
                        >
                        {card.contents.map((content, itemIndex) => {
                          const itemOpacity = getContentProgress(cardIndex, itemIndex)
                          
                          return (
                            <div
                              key={itemIndex}
                              className="relative"
                              style={{
                                opacity: itemOpacity,
                                transform: `translateY(${(1 - itemOpacity) * 30}px)`,
                                transition: 'none',
                              }}
                            >
                              {itemIndex < card.contents.length - 1 && (
                                <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                              )}

                              <div className="h-full flex flex-col justify-center px-6 py-8">
                                <div className="mb-6">
                                  <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg w-16 h-16">
                                    <span className="font-black text-white text-3xl">
                                      {content.number}
                                    </span>
                                  </div>
                                </div>

                                <h3 className="font-bold text-gray-900 leading-tight text-2xl mb-3">
                                  {content.subtitle}
                                </h3>

                                {content.description && (
                                  <p className="text-gray-600 leading-relaxed text-base">
                                    {content.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        </div>
                      </div>

                      {/* 장식 요소 */}
                      <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                    </div>
                  </div>
                  /* ==================== 데스크톱 코드 끝 ==================== */
                )}
              </div>
            )
          })}

          {/* 배경 장식 */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div 
              className={`
                absolute bg-blue-500/5 rounded-full
                ${isMobile 
                  ? 'top-1/4 -left-12 w-40 h-40' 
                  : 'top-1/4 -left-32 w-96 h-96 blur-3xl'
                }
              `}
              style={{
                transform: isMobile
                  // 🚀 모바일: translate3d로 GPU 가속
                  ? `translate3d(0, ${scrollProgress * 30}px, 0) scale(${1 + scrollProgress * 0.2})`
                  : `translateX(${scrollProgress * 50}px) scale(${1 + scrollProgress * 0.2})`,
                // 🚀 모바일: blur 제거 (성능 개선)
                filter: isMobile ? 'none' : undefined,
                willChange: 'transform',
              }}
            />
            <div 
              className={`
                absolute bg-purple-500/5 rounded-full
                ${isMobile 
                  ? 'bottom-1/4 -right-12 w-48 h-48' 
                  : 'bottom-1/4 -right-32 w-[30rem] h-[30rem] blur-3xl'
                }
              `}
              style={{
                transform: isMobile
                  // 🚀 모바일: translate3d로 GPU 가속
                  ? `translate3d(0, ${-scrollProgress * 30}px, 0) scale(${1 + scrollProgress * 0.2})`
                  : `translateX(${-scrollProgress * 50}px) scale(${1 + scrollProgress * 0.2})`,
                // 🚀 모바일: blur 제거 (성능 개선)
                filter: isMobile ? 'none' : undefined,
                willChange: 'transform',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}