import { Metadata } from 'next'
import Divider from '@/components/ui/Divider';
import PageHeader from '@/components/sections/PageHeader';
import { getHistoryData } from '@/lib/history';

export const metadata: Metadata = {
  description: '2005년 설립(사업장 2003년 설립)부터 현재까지, HOWDOYOUDO가 걸어온 20년의 발자취와 함께한 브랜드들의 특별한 순간들을 기록합니다.',
  keywords: [
    '연혁', 
    '히스토리', 
    '회사 역사', 
    '2005년 설립',
    '20년 경험',
    '프로젝트 기록',
    '브랜드 히스토리'
  ],
  openGraph: {
    title: 'History | HOWDOYOUDO',
    description: '2005년부터 20년간의 하우두유두 연혁과 주요 프로젝트',
    type: 'website',
  }
}

export default async function HistoryPage() {
  const companyHistory = await getHistoryData();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 상단 헤더 */}
        <PageHeader
          title='HISTORY'
          description={`2005년부터 현재까지,
        HOWDOYOUDO가 걸어온 발자취와 함께한 브랜드들의 특별한 순간들을 기록합니다.`}
        />

        {/* Divider */}
        <Divider />

        {/* Timeline Section */}
        <section className="py-8 sm:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
            {companyHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
                등록된 연혁이 없습니다.
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line - 모바일에서 왼쪽으로 이동 */}
                <div className="absolute left-5 sm:left-8 top-0 bottom-0 w-px bg-gray-200"></div>

                {companyHistory.map((yearData, yearIndex) => (
                  <div id={yearData.year} key={yearData.year} className="relative mb-8 sm:mb-12">
                    {/* Year marker - 모바일에서 크기 축소 */}
                    <div className="flex items-center mb-4 sm:mb-8">
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black text-white font-bold text-base sm:text-xl">
                        {yearData.year}
                      </div>
                      <div className="ml-3 sm:ml-6 flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Events for this year - 모바일에서 왼쪽 마진 축소 */}
                    <div className="ml-14 sm:ml-20 space-y-2 sm:space-y-3">
                      {yearData.events.map((event, eventIndex) => (
                        <div
                          key={`${yearData.year}-${eventIndex}`}
                          className="group relative pl-4 sm:pl-6 py-1.5 sm:py-2 hover:bg-gray-50 transition-colors duration-200"
                        >
                          {/* Event bullet point - 모바일에서 크기 축소 */}
                          <div className="absolute left-0 top-3 sm:top-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black group-hover:bg-gray-600 transition-colors duration-200"></div>

                          {/* Event content - 모바일에서 텍스트 크기 축소 */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <time className="text-xs sm:text-sm font-medium text-gray-900 min-w-16 sm:min-w-20">
                              {event.date}
                            </time>
                            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                              {event.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}