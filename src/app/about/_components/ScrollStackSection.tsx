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

  // 성능 최적화: requestAnimationFrame + passive listener
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

          let progress: number
          if (window.innerWidth < 768) {
            // 모바일: 섹션이 화면 하단에 나타나는 시점부터 진행도 시작 (공백 제거)
            const preload = windowHeight * 0.9
            progress = Math.max(0, Math.min(1,
              (-rect.top + preload) / (sectionHeight - windowHeight + preload)
            ))
          } else {
            // 데스크탑: sticky 기준 (rect.top=0일 때 0)
            progress = Math.max(0, Math.min(1,
              -rect.top / (sectionHeight - windowHeight)
            ))
          }

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
    
    const itemPhaseStart = 0.1
    const itemPhaseEnd = 0.6
    const itemPhaseSize = (itemPhaseEnd - itemPhaseStart) / itemCount
    
    const itemStart = itemPhaseStart + itemPhaseSize * itemIndex
    const itemEnd = itemStart + itemPhaseSize
    
    if (localProgress < itemStart) return 0
    if (localProgress > itemEnd) return 1
    
    return (localProgress - itemStart) / itemPhaseSize
  }

  const TITLE_BAR_H = 48

  return (
    <div
      ref={sectionRef}
      className={`relative ${bg} mb-8`}
      style={{ height: `${cards.length * 100}vh` }}
    >
      <div className={`sticky top-0 h-screen w-full overflow-hidden ${bg}`}>
        {isMobile ? (
          /* ===== MOBILE ===== */
          <div className="relative h-full">
            {cards.map((card, cardIndex) => {
              const { localProgress, isActive } = getCardProgress(cardIndex)
              const appearProgress = Math.min(1, localProgress / 0.4)

              const vh = typeof window !== 'undefined' ? window.innerHeight : 800
              const cardH = Math.round(vh * 0.5) // 화면 절반 고정 높이

              // 마지막 카드가 화면 정중앙에 오도록 topOffset 역산
              const topOffset = Math.max(16, vh / 2 - cardH / 2 - (cards.length - 1) * TITLE_BAR_H)

              const targetY = cardIndex * TITLE_BAR_H + topOffset + cardH / 2 - vh / 2
              const enterY = vh
              const currentY = isActive
                ? (1 - appearProgress) * enterY + appearProgress * targetY
                : enterY

              return (
                <div
                  key={cardIndex}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    zIndex: cardIndex * 10,
                    opacity: isActive ? appearProgress : 0,
                    transform: `translate3d(0, ${currentY}px, 0)`,
                    transition: 'none',
                    pointerEvents: 'none',
                    willChange: isActive ? 'transform, opacity' : 'auto',
                  }}
                >
                  <div
                    className="relative w-[90vw] rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      height: `${Math.round(cardH)}px`,
                      background: 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)',
                      border: '1.5px solid rgba(220,220,220,0.8)',
                      boxShadow: '0 16px 64px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* 타이틀바 */}
                    <div
                      className="flex-shrink-0 flex items-center px-5 bg-gradient-to-r from-gray-800/90 to-gray-700/90"
                      style={{ height: TITLE_BAR_H }}
                    >
                      <span className="text-white font-black tracking-wider text-base">{card.title}</span>
                    </div>

                    {/* 컨텐츠 */}
                    <div className="relative flex-1 overflow-hidden">
                      {/* 배경 워터마크 */}
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ opacity: localProgress < 0.2 ? localProgress * 5 : 0.07 }}
                      >
                        <h2
                          className="font-black tracking-tighter text-gray-400 select-none text-center"
                          style={{ fontSize: 'clamp(3rem, 18vw, 5rem)' }}
                        >
                          {card.title}
                        </h2>
                      </div>

                      {/* 항목 목록 */}
                      <div className="relative z-10 divide-y divide-gray-100">
                        {card.contents.map((content, itemIndex) => {
                          const itemOpacity = getContentProgress(cardIndex, itemIndex)
                          return (
                            <div
                              key={itemIndex}
                              className="flex items-start gap-4 px-5 py-4"
                              style={{
                                opacity: itemOpacity,
                                transform: `translate3d(0, ${(1 - itemOpacity) * 12}px, 0)`,
                                transition: 'none',
                                willChange: itemOpacity > 0 && itemOpacity < 1 ? 'transform, opacity' : 'auto',
                              }}
                            >
                              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-md mt-0.5">
                                <span className="font-black text-white text-sm">{content.number}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1">{content.subtitle}</h3>
                                {content.description && (
                                  <p className="text-gray-500 text-xs leading-relaxed">{content.description}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* 진행 도트 — 하단 고정 */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2" style={{ zIndex: 999 }}>
              {cards.map((_, i) => {
                const filled = scrollProgress >= i / cards.length
                return (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-gray-700 transition-all duration-300"
                    style={{ width: filled ? 24 : 6, opacity: filled ? 0.8 : 0.25 }}
                  />
                )
              })}
            </div>
          </div>
          /* ===== MOBILE END ===== */
        ) : (
          /* ===== DESKTOP ===== */
          <div className="relative w-full h-full flex items-start justify-center pt-2">
            {cards.map((card, cardIndex) => {
              const { localProgress, isActive } = getCardProgress(cardIndex)
              const nextCardIndex = cardIndex + 1
              const hasNextCard = nextCardIndex < cards.length
              const nextCardProgress = hasNextCard ? getCardProgress(nextCardIndex) : { localProgress: 0 }

              const appearProgress = Math.min(1, localProgress / 0.4)
              const cardOpacity = appearProgress
              const zIndex = cardIndex * 10

              const stackOffsetX = cardIndex * 80 - 70
              const slideX = (1 - appearProgress) * 300
              const transform = `translateX(${slideX + stackOffsetX}px)`

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
                    willChange: isActive && appearProgress < 1 ? 'transform, opacity' : 'auto',
                  }}
                >
                  {/* ==================== 데스크톱: 아래 코드는 절대 건드리지 않음 ==================== */}
                  <div className="relative w-[85vw] h-[65vh] flex flex-row">
                    {isActive && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center bg-gradient-to-r from-gray-800/90 to-gray-700/90 rounded-l-[3rem] border-2 border-white/50 border-r-0"
                        style={{ opacity: cardOpacity }}
                      >
                        <div
                          className="text-white font-black text-2xl tracking-wider"
                          style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
                        >
                          {card.title}
                        </div>
                      </div>
                    )}
                    <div
                      className="flex-1 relative px-16 py-16 backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/90 to-white/70 border-2 border-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.15)] flex items-center rounded-r-[3rem]"
                      style={{ perspective: '2000px', marginLeft: '80px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-r-[3rem]" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-r-[3rem] blur-2xl -z-10" />
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ opacity: localProgress < 0.2 ? localProgress * 5 : 0.40 }}
                      >
                        <h2
                          className="font-black tracking-tighter bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-clip-text text-transparent leading-none select-none"
                          style={{ fontSize: 'clamp(6rem, 12vw, 14rem)' }}
                        >
                          {card.title}
                        </h2>
                      </div>
                      <div className="relative z-10 w-full">
                        <div
                          className="grid gap-8"
                          style={{ gridTemplateColumns: `repeat(${card.contents.length}, 1fr)` }}
                        >
                          {card.contents.map((content, itemIndex) => {
                            const itemOpacity = getContentProgress(cardIndex, itemIndex)
                            return (
                              <div
                                key={itemIndex}
                                className="relative"
                                style={{ opacity: itemOpacity, transform: `translateY(${(1 - itemOpacity) * 30}px)`, transition: 'none' }}
                              >
                                {itemIndex < card.contents.length - 1 && (
                                  <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                                )}
                                <div className="h-full flex flex-col justify-center px-6 py-8">
                                  <div className="mb-6">
                                    <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg w-16 h-16">
                                      <span className="font-black text-white text-3xl">{content.number}</span>
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-gray-900 leading-tight text-2xl mb-3">{content.subtitle}</h3>
                                  {content.description && (
                                    <p className="text-gray-600 leading-relaxed text-base">{content.description}</p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                    </div>
                  </div>
                  {/* ==================== 데스크톱 코드 끝 ==================== */}
                </div>
              )
            })}

            {/* 배경 장식 */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div
                className="absolute top-1/4 -left-32 w-96 h-96 blur-3xl bg-blue-500/5 rounded-full"
                style={{ transform: `translateX(${scrollProgress * 50}px) scale(${1 + scrollProgress * 0.2})`, willChange: 'transform' }}
              />
              <div
                className="absolute bottom-1/4 -right-32 w-[30rem] h-[30rem] blur-3xl bg-purple-500/5 rounded-full"
                style={{ transform: `translateX(${-scrollProgress * 50}px) scale(${1 + scrollProgress * 0.2})`, willChange: 'transform' }}
              />
            </div>
          </div>
          /* ===== DESKTOP END ===== */
        )}
      </div>
    </div>
  )
}