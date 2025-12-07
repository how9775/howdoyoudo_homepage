import React from 'react';
import AboutSection from './_components/AboutSection';
import AboutHeroTitle from './_components/AboutHeroTitle';
import ScrollStackSection from './_components/ScrollStackSection';

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