import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/utils/supabase';
import { SITE_URL } from '@/lib/seo';

// works 등록/수정/삭제 시 revalidatePath('/sitemap.xml')로 즉시 갱신되며,
// 그 외에는 1시간마다 재생성
export const revalidate = 3600;

const BASE_URL = SITE_URL;

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
    url: `${BASE_URL}/history`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
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
      .select('id, updated_at, thumbnail_image')
      .eq('is_active', true)
      .order('id', { ascending: false });

    if (error || !works) {
      return staticPages;
    }

    const workPages: MetadataRoute.Sitemap = works.map((work) => ({
      url: `${BASE_URL}/works/${work.id}`,
      lastModified: new Date(work.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
      images: work.thumbnail_image ? [work.thumbnail_image] : undefined,
    }));

    return [...staticPages, ...workPages];
  } catch {
    return staticPages;
  }
}
