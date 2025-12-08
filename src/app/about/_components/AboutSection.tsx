'use client';

import React from 'react';
import AboutCard from './AboutCard';
import Divider from '@/components/ui/Divider';

export default function AboutSection() {
  const getCurrentYear = () => {
    return new Date().getFullYear() - 2005;
  }

  return (
    <section className="pb-20 sm:pb-32 lg:pb-40 bg-gradient-to-b from-white to-whtie paper-font">
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24 lg:space-y-32">

        <AboutCard
          title="No.1"
          subtitle="하우두유두"
          headline={
            <div className='w-full text-center lg:text-left'>
              <div className='flex items-center justify-center lg:justify-start lg:gap-1'>
                <div className="text-lg sm:text-2xl lg:text-4xl font-black text-black mb-2 sm:mb-3 lg:mb-4">
                  {getCurrentYear()}년 동안 축적된 경험과 노하우
                </div>
                <span className="text-sm sm:text-lg lg:text-xl mb-1">를 바탕으로</span>
              </div>
              <span className="block mt-1 text-sm sm:text-lg lg:text-xl">기업 이미지와 경쟁력 강화를 위한 손과 발이 되고자 합니다.</span>
            </div>
          }
          description={[
            '어디서부터 어떻게 시작해야 할 지 모르셔도 괜찮습니다.',
            '하우두유두의 인재들이 기업 이미지와 브랜드 확장에 도움을 드릴 것입니다.'
          ]}
          descriptionMobile={[
            '어디서부터 어떻게 시작해야 할 지 모르셔도 괜찮습니다.',
            '하우두유두의 인재들이 기업 이미지와',
            '브랜드 확장에 도움을 드릴 것입니다.'
          ]}
          gradientFrom="#172036"
          gradientTo="#0e1b2b"
          backgroundImage="/images/about-no1-bg.jpg"
          trackingWidth={0.5}
        />

        <Divider />

        <AboutCard
          title="Best"
          subtitle="하우두유두"
          headline={
            <div className='w-full text-center lg:text-left'>
              <div className='flex items-center justify-center lg:justify-start gap-1 lg:gap-2'>
                <span className="text-sm sm:text-lg lg:text-xl mb-1">하우두유두를 지탱하는 프로 집단의 </span>
                <div className="text-lg sm:text-2xl lg:text-4xl font-black text-black mb-2 sm:mb-3 lg:mb-4">
                  Best 정신입니다.
                </div>
              </div>
              <span className="block mt-1 text-sm sm:text-lg lg:text-xl">기업 이미지와 경쟁력 강화를 위한 손과 발이 되고자 합니다.</span>
            </div>
          }
          description={[
            '적은 광고비로도 목표를 정확히 적중시키는 통쾌한 쌍방향 커뮤니케이션으로,',
            '귀사의 든든한 동반자가 되어 책임 있는 사명감을 성실히 수행하겠습니다.',
          ]}
          descriptionMobile={[
            '적은 광고비로도 목표를 정확히 적중시키는',
            '통쾌한 쌍방향 커뮤니케이션으로',
            '귀사의 든든한 동반자가 되어',
            '책임 있는 사명감을 성실히 수행하겠습니다.'
          ]}
          gradientFrom="#0e1b2b"
          gradientTo="#172036"
          backgroundImage="/images/about-best-bg.jpg"
          reverse
          trackingWidth={0.6}
        />

      </div>
    </section>
  );
}