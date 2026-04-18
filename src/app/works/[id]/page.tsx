import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WorkDetailClient from '../_components/WorkDetailClient';
import { WorkItem } from '@/types/works';

interface WorkDetailResponse {
  work: WorkItem;
  navigation: {
    prev: { id: number; title: string } | null;
    next: { id: number; title: string } | null;
  };
}

const BASE_URL = 'https://hdyd.co.kr';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/works?page=1&limit=1000`, {
      next: { revalidate: 3600 },
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
      next: { revalidate: 3600 },
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

  const pageUrl = `${BASE_URL}/works/${id}`;

  return {
    title: `${data.work.title} | HOWDOYOUDO`,
    description: data.work.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: `${data.work.title} | HOWDOYOUDO`,
      description: data.work.description,
      siteName: 'HOWDOYOUDO',
      images: [
        {
          url: data.work.thumbnailImage,
          alt: data.work.title,
        },
      ],
    },
  };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkDetail(id);

  if (!data) {
    notFound();
  }

  const pageUrl = `${BASE_URL}/works/${id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.work.title,
    description: data.work.description,
    image: data.work.thumbnailImage,
    url: pageUrl,
    datePublished: data.work.eventDate,
    publisher: {
      '@type': 'Organization',
      name: 'HOWDOYOUDO',
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkDetailClient initialData={data} />
    </>
  );
}