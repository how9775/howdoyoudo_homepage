'use client';

import React from 'react';
import AboutCard from './AboutCard';
import Divider from '@/components/ui/Divider';

export default function AboutSection() {
  const getCurrentYear = () => {
    return new Date().getFullYear() - 2005;
  }

  return (
    <section className="pb-20 sm:pb-32 lg:pb-40 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24 lg:space-y-32">

        <AboutCard
          title="No.1"
          subtitle="하우두유두"
          headline={
            <>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-4 sm:mb-6">
                {getCurrentYear()}년 경험과 노하우
              </div>
              <span>기업의 성장과 가치를 위한 완벽한 파트너</span>
            </>
          }
          description={[
            '시작부터 함께합니다.',
            '하우두유두 전문가들이 귀사의 성공적인 브랜딩을 이끌 것입니다.',
          ]}
          gradientFrom="#172036"
          gradientTo="#0e1b2b"
          backgroundImage="/images/about-no1-bg.jpg"
        />

        <Divider />

        <AboutCard
          title="Best"
          subtitle="하우두유두"
          headline={
            <>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-4 sm:mb-6">
                하우두유두를 움직이는 힘,
              </div>
              그것은 바로 프로 집단의 <span className="font-extrabold text-black">Best 정신</span>입니다.
            </>
          }
          description={[
            '적은 광고비로도 목표를 정확히 적중시키는 통쾌한 쌍방향 커뮤니케이션으로,',
            '귀사의 든든한 동반자가 되어 책임 있는 사명감을 성실히 수행하겠습니다.',
          ]}
          gradientFrom="#0e1b2b"
          gradientTo="#172036"
          backgroundImage="/images/about-best-bg.jpg"
          reverse
        />

      </div>
    </section>
  );
}