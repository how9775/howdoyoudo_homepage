import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/utils/supabase';

export const revalidate = 86400; // 24시간마다 재생성 (Vercel ISR)

const BASE_URL = 'https://hdyd.co.kr';

const staticPages: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date('2024-12-09'),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date('2024-12-09'),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/works`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date('2024-12-09'),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: works, error } = await supabaseAdmin
      .from('works')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error || !works) {
      return staticPages;
    }

    const workPages: MetadataRoute.Sitemap = works.map((work) => ({
      url: `${BASE_URL}/works/${work.id}`,
      lastModified: new Date(work.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...workPages];
  } catch {
    return staticPages;
  }
}
