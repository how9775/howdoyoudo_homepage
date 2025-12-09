// src/app/layout.tsx
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/ui/ScrollToTop'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'HOWDOYOUDO | (주) 하우두유두',
    template: '%s | HOWDOYOUDO | (주) 하우두유두'
  },
  description: '2005년 설립, 20년 동안 축적된 경험과 노하우를 바탕으로 기업 이미지와 경쟁력 강화를 위한 BTL 마케팅 전문 기업입니다. Corporate Event, Public Event, Exhibition, Star Marketing 등 통합 프로모션 솔루션을 제공합니다.',
  keywords: [
    '하우두유두', 
    'HOWDOYOUDO', 
    'BTL 마케팅', 
    'IMC', 
    '통합 마케팅 커뮤니케이션',
    '런칭쇼케이스', 
    '프로모션 이벤트', 
    'Corporate Event',
    'Public Event',
    'Exhibition',
    'Star Marketing',
    'VMD',
    'SPACE & DISPLAY'
  ],
  authors: [{ name: '(주)하우두유두' }],
  creator: '(주)하우두유두',
  publisher: '(주)하우두유두',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'HOWDOYOUDO',
    title: 'HOWDOYOUDO | (주) 하우두유두',
    description: 'BTL 영역의 통합적인 프로모션 대행사',
    images:{
      url: '/howdoyoudo_siteImage.png.png',
      width: 1200,
      height: 630,
      alt: 'HOWDOYOUDO Open Graph Image',
    }
  },
  robots: {
    index: true,
    follow: true,
  },
  icons:{
    icon: '/favicon.png',
  }
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} scroll-smooth`}>
      <meta name="google-site-verification" content="MDRnz_SzdLL3DgbQ8kz9fIMS-B8BiDqaQCOl9EfHQVY" />
      <meta name="naver-site-verification" content="80f4df43f6a8b24c6296aa1f5ed1eea4146d488e" />
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
          <div className="min-h-screen">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        
        <ScrollToTop />
      </body>
    </html>
  )
}