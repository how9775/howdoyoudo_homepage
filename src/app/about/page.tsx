import React from 'react';
import AboutSection from './_components/AboutSection';
import AboutHeroTitle from './_components/AboutHeroTitle';
import ScrollStackSection from './_components/ScrollStackSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  description: '하우두유두는 CONCEPT IDEA, COMMUNICATION, PROFESSIONAL의 가치로 고객이 목표하는 마케팅 성과를 위해 최적의 One Stop Service를 제공합니다. Proposals, Prepare, Action의 3단계 프로세스로 완벽한 이벤트를 실현합니다.',
  keywords: [
    '회사 소개',
    '이벤트 프로세스',
    'One Stop Service',
    'CONCEPT IDEA',
    'COMMUNICATION',
    'PROFESSIONAL',
    '토탈 솔루션'
  ],
  openGraph: {
    title: 'About | HOWDOYOUDO',
    description: '하우두유두의 서비스 프로세스 - Proposals, Prepare, Action',
    type: 'website',
    images: {
      url: '/howdoyoudo_siteImage.png.png',
      width: 1200,
      height: 630,
      alt: 'HOWDOYOUDO Open Graph Image',
    }
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen text-gray-900 bg-white">
      {/* Hero Section - Full Screen */}
      <AboutHeroTitle />
      {/* About Philosophy Section */}
      <AboutSection />
      {/* Scroll Stack Section - All 3 Cards */}
      <ScrollStackSection
        bg="bg-gradient-to-b from-white via-gray-100 to-gray-50"
        cards={[
          {
            title: "PROPOSALS",
            contents: [
              {
                number: "1",
                subtitle: "행사 개요 제공",
                description: "컨셉 방향을 잡기 위한 대략적인 개요 제공"
              },
              {
                number: "2",
                subtitle: "기획안 및 견적서 제출",
                description: "행사 기획에 관한 제안과 견적서 제출"
              },
              {
                number: "3",
                subtitle: "쌍방향 조율",
                description: "미팅을 통한 세부적인 기획안 수정과 견적서 조율"
              },
              {
                number: "4",
                subtitle: "계약",
                description: ""
              }
            ]
          },
          {
            title: "PREPARE",
            contents: [
              {
                number: "1",
                subtitle: "섭외 및 초청",
                description: "장소/공연/PR/인력 섭외 및 초청 진행"
              },
              {
                number: "2",
                subtitle: "디자인 제안",
                description: "행사에 필요한 디자인 제공 및 제작"
              },
              {
                number: "3",
                subtitle: "세부 조율",
                description: "행사에 추가적으로 발생하는 클라이언트의 요청에 빠른 피드백과 제안 진행"
              }
            ]
          },
          {
            title: "ACTION",
            contents: [
              {
                number: "1",
                subtitle: "토탈 이벤트 진행",
                description: "팀장 급 오퍼레이터와 전문 스태프들의 행사 진행"
              },
              {
                number: "2",
                subtitle: "PR 및 릴리즈",
                description: "각 언론사 및 인플루언서 릴리즈 진행"
              },
              {
                number: "3",
                subtitle: "결과보고서 진행",
                description: "전문 포토 그래퍼 및 영상 제작을 통한 결과보고서 진행"
              }
            ]
          }
        ]}
      />
    </div>
  );
}