import { Metadata } from 'next';
import { WorksResponse } from '@/types/works';
import WorksClient from './_components/WorksClient';
import PageHeader from '@/components/sections/PageHeader';

export const metadata: Metadata = {
  description: 'SPACE & DISPLAY VMD, LAUNCHING SHOWCASE, PROMOTION EVENT, STAR MARKETING 등 하우두유두가 진행한 다양한 BTL 프로젝트를 확인하세요. Full-Covering System으로 제공되는 토탈 솔루션 사례를 소개합니다.',
  keywords: [
    '포트폴리오',
    'BTL 프로젝트',
    '런칭쇼케이스',
    '프로모션 이벤트',
    'VMD',
    'SPACE & DISPLAY',
    'Star Marketing',
    '이벤트 사례',
    'Full-Covering System'
  ],
  openGraph: {
    title: 'Works | HOWDOYOUDO',
    description: 'BTL 영역의 다양한 프로젝트 포트폴리오',
    type: 'website',
    images: {
      url: '/howdoyoudo_siteImage.png',
      width: 1200,
      height: 630,
      alt: 'HOWDOYOUDO Open Graph Image',
    }
  }
}

// Server component that fetches initial data
async function getInitialData(): Promise<WorksResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/works?page=1&limit=21`, {
      cache: 'no-store', // Disable caching for development
    });

    if (!response.ok) {
      throw new Error('Failed to fetch works');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      works: [],
      totalCount: 0,
      categories: [],
      hasMore: false,
      currentPage: 1
    };
  }
}

export default async function WorksPage() {
  const initialData = await getInitialData();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader title='CREATIVE BUSINESS' description='하우두유두가 함께한 여정을 살펴보세요' />

        <WorksClient initialData={initialData} />
      </div>
    </div>
  );
}