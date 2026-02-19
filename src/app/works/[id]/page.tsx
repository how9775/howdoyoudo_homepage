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

async function getWorkDetail(id: string): Promise<WorkDetailResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/works/${id}`, {
      cache: 'no-store',
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
  return {
    title: `${data.work.title} | HOWDOYOUDO`,
    description: data.work.description,
  };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkDetail(id);

  if (!data) {
    notFound();
  }

  return <WorkDetailClient initialData={data} />;
}