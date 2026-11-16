import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import WorkDetailClient from '../_components/WorkDetailClient';
import { WorkItem } from '@/types/works';
import { SITE_URL, WORKS_TAG, workTag, serializeJsonLd } from '@/lib/seo';

interface WorkDetailResponse {
  work: WorkItem;
  navigation: {
    prev: { id: number; title: string } | null;
    next: { id: number; title: string } | null;
  };
}

const BASE_URL = SITE_URL;

export const revalidate = 3600;
// 빌드 이후 새로 등록된 게시글도 첫 요청 시 생성 후 캐시
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/works?page=1&limit=1000`, {
      next: { revalidate: 3600, tags: [WORKS_TAG] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.works ?? []).map((work: { id: number }) => ({ id: String(work.id) }));
  } catch {
    return [];
  }
}

async function getWorkDetail(id: string): Promise<WorkDetailResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/works/${id}`, {
      next: { revalidate: 3600, tags: [WORKS_TAG, workTag(id)] },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching work detail:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const data = await getWorkDetail(id);
  if (!data) {
    return { title: 'Work Not Found' };
  }

  const { work } = data;
  const pageUrl = `${BASE_URL}/works/${id}`;
  const title = `${work.title} | HOWDOYOUDO`;
  const description = buildDescription(work);
  const images = [work.thumbnailImage, ...work.contentImages.slice(0, 3)].filter(Boolean);

  return {
    title: { absolute: title },
    description,
    keywords: [
      work.title,
      work.categoryDisplayName,
      `${work.eventYear} ${work.categoryDisplayName}`,
      '하우두유두',
      'HOWDOYOUDO',
      'BTL 마케팅',
      '프로모션 이벤트',
      '포트폴리오',
    ].filter(Boolean),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title,
      description,
      siteName: 'HOWDOYOUDO',
      locale: 'ko_KR',
      publishedTime: work.eventDate,
      section: work.categoryDisplayName || undefined,
      images: images.map((url) => ({ url, alt: work.title })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: work.thumbnailImage ? [work.thumbnailImage] : undefined,
    },
  };
}

// description이 비어 있는 게시글도 검색 결과 스니펫이 나오도록 자동 생성
function buildDescription(work: WorkItem): string {
  const raw = (work.description || '').replace(/\s+/g, ' ').trim();
  if (raw) {
    return raw.length > 155 ? `${raw.slice(0, 155)}…` : raw;
  }
  const date = work.eventDate ? work.eventDate.slice(0, 7).replace('-', '.') : '';
  const category = work.categoryDisplayName ? ` ${work.categoryDisplayName}` : '';
  return `${work.title}${date ? ` (${date})` : ''} — 하우두유두(HOWDOYOUDO)가 진행한${category} BTL 프로젝트입니다. 기획부터 운영까지 Full-Covering System으로 완성한 현장을 확인하세요.`;
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkDetail(id);

  if (!data) {
    notFound();
  }

  const { work } = data;
  const pageUrl = `${BASE_URL}/works/${id}`;
  const organization = {
    '@type': 'Organization',
    name: 'HOWDOYOUDO',
    alternateName: '(주)하우두유두',
    url: BASE_URL,
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: work.title,
      description: buildDescription(work),
      image: [work.thumbnailImage, ...work.contentImages].filter(Boolean).slice(0, 5),
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      inLanguage: 'ko-KR',
      datePublished: work.eventDate,
      articleSection: work.categoryDisplayName || undefined,
      author: organization,
      publisher: organization,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Works', item: `${BASE_URL}/works` },
        { '@type': 'ListItem', position: 3, name: work.title, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Suspense>
        <WorkDetailClient initialData={data} />
      </Suspense>
    </>
  );
}