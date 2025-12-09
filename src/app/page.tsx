
import HeroSection from '@/components/sections/HeroSection'
import ImageGallery from '@/components/sections/ImageGallery'
import { Metadata } from 'next'


export const metadata: Metadata = {
  description: '하우두유두는 20년 동안 축적된 경험과 노하우를 바탕으로 기업 이미지와 경쟁력 강화를 위한 손과 발이 되고자 합니다. BTL 영역의 통합적인 프로모션 대행사로서 One Stop Service를 제공합니다.',
  keywords: ['토탈 이벤트 대행사', 'BTL 프로모션', '원스톱 서비스', '마케팅 솔루션'],
  openGraph: {
    title: 'HOWDOYOUDO | (주) 하우두유두',
    description: 'BTL 영역의 통합적인 프로모션 대행사 - 20년 경험의 전문가 그룹',
    type: 'website',
    images: {
      url: '/howdoyoudo_siteImage.png.png',
      width: 1200,
      height: 630,
      alt: 'HOWDOYOUDO Open Graph Image',
    }
  }
}

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection />

      <section className="relative py-10 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        {/* Animated Divider */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-on-scroll">
            <div className="inline-flex items-center space-x-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
              <span className="text-sm font-medium text-gray-500 tracking-wider uppercase">
                Our Work
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
            </div>
          </div>
        </div>
      </section>

      <ImageGallery />
    </div>
  )
}